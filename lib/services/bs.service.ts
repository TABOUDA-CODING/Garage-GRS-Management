import "server-only";
import crypto from "node:crypto";
import { Prisma, StatutBS } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifierEligibiliteGeneration } from "./bs-rules";

export class BsError extends Error {}

async function nextBsNumero(tx: Prisma.TransactionClient): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `BS-${year}-`;
  const last = await tx.bonDeSortie.findFirst({
    where: { numero: { startsWith: prefix } },
    orderBy: { numero: "desc" },
    select: { numero: true },
  });
  const nextSeq = last ? Number(last.numero.slice(prefix.length)) + 1 : 1;
  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

function genererQrToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

interface Derogation {
  userId: string;
  motif: string;
}

async function creerBonDeSortie(
  tx: Prisma.TransactionClient,
  params: { dossierId: string; derogation: Derogation | null },
) {
  const numero = await nextBsNumero(tx);
  return tx.bonDeSortie.create({
    data: {
      numero,
      dossierId: params.dossierId,
      qrToken: genererQrToken(),
      statut: StatutBS.VALIDE,
      derogationPaiement: params.derogation !== null,
      derogationMotif: params.derogation?.motif ?? null,
      derogationParId: params.derogation?.userId ?? null,
    },
  });
}

export interface GenererBsInput {
  dossierId: string;
  adminId: string;
  derogationMotif?: string;
}

export async function genererBonDeSortie(input: GenererBsInput) {
  const dossier = await prisma.dossier.findUnique({ where: { id: input.dossierId } });
  if (!dossier) {
    throw new BsError("Dossier introuvable");
  }

  const eligibilite = verifierEligibiliteGeneration(dossier, input.derogationMotif);
  if (!eligibilite.ok) {
    throw new BsError(eligibilite.error);
  }

  const bsValideExistant = await prisma.bonDeSortie.findFirst({
    where: { dossierId: input.dossierId, statut: StatutBS.VALIDE },
  });
  if (bsValideExistant) {
    throw new BsError("Un bon de sortie valide existe déjà pour ce dossier");
  }

  const derogation: Derogation | null = eligibilite.derogationRequise
    ? { userId: input.adminId, motif: input.derogationMotif!.trim() }
    : null;

  return prisma.$transaction((tx) => creerBonDeSortie(tx, { dossierId: input.dossierId, derogation }));
}

export interface RegenererBsInput {
  dossierId: string;
  ancienBsId: string;
  adminId: string;
}

export async function regenererBonDeSortie(input: RegenererBsInput) {
  return prisma.$transaction(async (tx) => {
    const ancien = await tx.bonDeSortie.findUnique({ where: { id: input.ancienBsId } });
    if (!ancien || ancien.dossierId !== input.dossierId) {
      throw new BsError("Bon de sortie introuvable");
    }
    if (ancien.statut !== StatutBS.VALIDE) {
      throw new BsError("Seul un bon de sortie valide peut être régénéré");
    }

    await tx.bonDeSortie.update({
      where: { id: ancien.id },
      data: { statut: StatutBS.ANNULE },
    });

    return creerBonDeSortie(tx, {
      dossierId: input.dossierId,
      derogation: ancien.derogationPaiement
        ? {
            userId: input.adminId,
            motif: ancien.derogationMotif ?? "Régénération d'un bon de sortie perdu",
          }
        : null,
    });
  });
}

export async function getBonDeSortieById(id: string) {
  return prisma.bonDeSortie.findUnique({
    where: { id },
    include: {
      dossier: { include: { vehicule: { include: { client: true } } } },
    },
  });
}
