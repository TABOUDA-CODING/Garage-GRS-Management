import "server-only";
import { Prisma, StatutDossier, type Role, type TypeClient, type TypeIntervention } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { transitionEstAutorisee } from "./dossier-transitions";

export class DossierError extends Error {}

const PAGE_SIZE = 10;

export const KANBAN_STATUTS = [
  StatutDossier.ENTRE,
  StatutDossier.EN_DIAGNOSTIC,
  StatutDossier.EN_COURS,
  StatutDossier.PRET,
] as const;

export interface CreateDossierInput {
  mode: "existing" | "new";
  vehiculeId?: string;
  motifDeclare: string;
  typesIntervention: TypeIntervention[];
  userId: string;
  client?: {
    nom: string;
    telephone: string;
    type: TypeClient;
    raisonSociale: string | null;
    ice: string | null;
  };
  vehicule?: {
    immatriculation: string;
    marque: string;
    modele: string;
    annee: number | null;
    couleur: string | null;
    kilometrage: number | null;
  };
}

export async function listDossiers(params: { query?: string; statut?: StatutDossier; page?: number }) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const query = params.query?.trim();

  const where: Prisma.DossierWhereInput = {
    ...(params.statut ? { statut: params.statut } : {}),
    ...(query
      ? {
          OR: [
            { numero: { contains: query, mode: "insensitive" as const } },
            { vehicule: { immatriculation: { contains: query, mode: "insensitive" as const } } },
            { vehicule: { client: { nom: { contains: query, mode: "insensitive" as const } } } },
          ],
        }
      : {}),
  };

  const [dossiers, total] = await Promise.all([
    prisma.dossier.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { vehicule: { include: { client: true } } },
    }),
    prisma.dossier.count({ where }),
  ]);

  return {
    dossiers,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getDossierById(id: string) {
  return prisma.dossier.findUnique({
    where: { id },
    include: {
      vehicule: { include: { client: true } },
      historique: { orderBy: { createdAt: "asc" }, include: { user: true } },
      bonsDeSortie: { orderBy: { dateGeneration: "desc" }, include: { derogationPar: true } },
      factures: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function listDossiersAtelier(params: { technicienId?: string }) {
  return prisma.dossier.findMany({
    where: {
      statut: { in: [...KANBAN_STATUTS] },
      ...(params.technicienId ? { technicienId: params.technicienId } : {}),
    },
    orderBy: { dateEntree: "asc" },
    include: { vehicule: { include: { client: true } } },
  });
}

export async function changerStatutDossier(params: {
  dossierId: string;
  statutCible: StatutDossier;
  userId: string;
  role: Role;
}) {
  return prisma.$transaction(async (tx) => {
    const dossier = await tx.dossier.findUnique({ where: { id: params.dossierId } });
    if (!dossier) {
      throw new DossierError("Dossier introuvable");
    }
    if (params.role === "TECHNICIEN" && dossier.technicienId !== params.userId) {
      throw new DossierError("Ce dossier n'est pas assigné à ce technicien");
    }
    if (dossier.statut === params.statutCible) {
      return dossier;
    }
    if (!transitionEstAutorisee(dossier.statut, params.statutCible)) {
      throw new DossierError("Transition de statut non autorisée");
    }

    const updated = await tx.dossier.update({
      where: { id: params.dossierId },
      data: {
        statut: params.statutCible,
        historique: {
          create: {
            statutAvant: dossier.statut,
            statutApres: params.statutCible,
            userId: params.userId,
          },
        },
      },
    });

    return updated;
  });
}

export async function assignerTechnicien(params: { dossierId: string; technicienId: string | null }) {
  if (params.technicienId) {
    const technicien = await prisma.user.findUnique({ where: { id: params.technicienId } });
    if (!technicien || technicien.role !== "TECHNICIEN" || !technicien.actif) {
      throw new DossierError("Technicien invalide");
    }
  }

  return prisma.dossier.update({
    where: { id: params.dossierId },
    data: { technicienId: params.technicienId },
  });
}

async function nextDossierNumero(tx: Prisma.TransactionClient): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `DOS-${year}-`;
  const last = await tx.dossier.findFirst({
    where: { numero: { startsWith: prefix } },
    orderBy: { numero: "desc" },
    select: { numero: true },
  });
  const nextSeq = last ? Number(last.numero.slice(prefix.length)) + 1 : 1;
  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

async function resolveVehiculeId(tx: Prisma.TransactionClient, input: CreateDossierInput): Promise<string> {
  if (input.mode === "existing") {
    if (!input.vehiculeId) {
      throw new DossierError("Véhicule requis");
    }
    const vehicule = await tx.vehicule.findUnique({ where: { id: input.vehiculeId } });
    if (!vehicule) {
      throw new DossierError("Véhicule introuvable");
    }
    return vehicule.id;
  }

  if (!input.client || !input.vehicule) {
    throw new DossierError("Informations client et véhicule manquantes");
  }

  const existingVehicule = await tx.vehicule.findUnique({
    where: { immatriculation: input.vehicule.immatriculation },
  });
  if (existingVehicule) {
    throw new DossierError("Un véhicule avec cette immatriculation existe déjà");
  }

  const client = await tx.client.create({
    data: {
      nom: input.client.nom,
      telephone: input.client.telephone,
      type: input.client.type,
      raisonSociale: input.client.raisonSociale,
      ice: input.client.ice,
    },
  });

  const vehicule = await tx.vehicule.create({
    data: {
      immatriculation: input.vehicule.immatriculation,
      marque: input.vehicule.marque,
      modele: input.vehicule.modele,
      annee: input.vehicule.annee,
      couleur: input.vehicule.couleur,
      kilometrage: input.vehicule.kilometrage,
      clientId: client.id,
    },
  });

  return vehicule.id;
}

export async function createDossier(input: CreateDossierInput) {
  const MAX_ATTEMPTS = 5;
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const vehiculeId = await resolveVehiculeId(tx, input);
          const numero = await nextDossierNumero(tx);

          return tx.dossier.create({
            data: {
              numero,
              vehiculeId,
              motifDeclare: input.motifDeclare,
              typesIntervention: input.typesIntervention,
              historique: {
                create: [{ statutAvant: null, statutApres: StatutDossier.ENTRE, userId: input.userId }],
              },
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (error instanceof DossierError) {
        throw error;
      }
      lastError = error;
      const isRetryable =
        error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2002" || error.code === "P2034");
      if (!isRetryable) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new DossierError("Impossible de créer le dossier");
}
