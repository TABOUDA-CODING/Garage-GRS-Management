import "server-only";
import { prisma } from "@/lib/prisma";
import type { VehiculeInput } from "@/lib/validations/vehicule.validation";

export class VehiculeError extends Error {}

const PAGE_SIZE = 10;

export async function listVehicules(params: { query?: string; page?: number }) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const query = params.query?.trim();

  const where = query
    ? {
        OR: [
          { immatriculation: { contains: query, mode: "insensitive" as const } },
          { marque: { contains: query, mode: "insensitive" as const } },
          { modele: { contains: query, mode: "insensitive" as const } },
          { client: { nom: { contains: query, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [vehicules, total] = await Promise.all([
    prisma.vehicule.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { client: true },
    }),
    prisma.vehicule.count({ where }),
  ]);

  return {
    vehicules,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function listVehiculesForSelect() {
  return prisma.vehicule.findMany({
    orderBy: { immatriculation: "asc" },
    include: { client: { select: { nom: true } } },
  });
}

export async function getVehiculeById(id: string) {
  return prisma.vehicule.findUnique({
    where: { id },
    include: {
      client: true,
      dossiers: { orderBy: { dateEntree: "desc" } },
    },
  });
}

function toNullable(value: string | undefined): string | null {
  return value && value.length > 0 ? value : null;
}

function toNullableInt(value: string | undefined): number | null {
  return value && value.length > 0 ? Number(value) : null;
}

async function assertImmatriculationLibre(immatriculation: string, excludeId?: string) {
  const existing = await prisma.vehicule.findUnique({ where: { immatriculation } });
  if (existing && existing.id !== excludeId) {
    throw new VehiculeError("Un véhicule avec cette immatriculation existe déjà");
  }
}

export async function createVehicule(data: VehiculeInput) {
  await assertImmatriculationLibre(data.immatriculation);

  return prisma.vehicule.create({
    data: {
      immatriculation: data.immatriculation,
      marque: data.marque,
      modele: data.modele,
      annee: toNullableInt(data.annee),
      couleur: toNullable(data.couleur),
      kilometrage: toNullableInt(data.kilometrage),
      clientId: data.clientId,
    },
  });
}

export async function updateVehicule(id: string, data: VehiculeInput) {
  await prisma.vehicule.findUniqueOrThrow({ where: { id } });
  await assertImmatriculationLibre(data.immatriculation, id);

  return prisma.vehicule.update({
    where: { id },
    data: {
      immatriculation: data.immatriculation,
      marque: data.marque,
      modele: data.modele,
      annee: toNullableInt(data.annee),
      couleur: toNullable(data.couleur),
      kilometrage: toNullableInt(data.kilometrage),
      clientId: data.clientId,
    },
  });
}

export async function deleteVehicule(id: string): Promise<void> {
  const vehicule = await prisma.vehicule.findUnique({
    where: { id },
    include: { _count: { select: { dossiers: true } } },
  });

  if (!vehicule) {
    throw new VehiculeError("Véhicule introuvable");
  }

  if (vehicule._count.dossiers > 0) {
    throw new VehiculeError(
      "Impossible de supprimer ce véhicule : il possède des dossiers enregistrés",
    );
  }

  await prisma.vehicule.delete({ where: { id } });
}
