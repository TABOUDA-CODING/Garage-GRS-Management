import "server-only";
import { prisma } from "@/lib/prisma";
import type { ClientInput } from "@/lib/validations/client.validation";

export class ClientError extends Error {}

const PAGE_SIZE = 10;

export async function listClients(params: { query?: string; page?: number }) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const query = params.query?.trim();

  const where = query
    ? {
        OR: [
          { nom: { contains: query, mode: "insensitive" as const } },
          { telephone: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { nom: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { vehicules: true } } },
    }),
    prisma.client.count({ where }),
  ]);

  return {
    clients,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function listClientsForSelect() {
  return prisma.client.findMany({
    orderBy: { nom: "asc" },
    select: { id: true, nom: true, telephone: true },
  });
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      vehicules: { orderBy: { createdAt: "desc" } },
    },
  });
}

function toNullable(value: string | undefined): string | null {
  return value && value.length > 0 ? value : null;
}

export async function createClient(data: ClientInput) {
  return prisma.client.create({
    data: {
      nom: data.nom,
      telephone: data.telephone,
      email: toNullable(data.email),
      cin: toNullable(data.cin),
      type: data.type,
      raisonSociale: toNullable(data.raisonSociale),
      ice: toNullable(data.ice),
    },
  });
}

export async function updateClient(id: string, data: ClientInput) {
  await prisma.client.findUniqueOrThrow({ where: { id } });

  return prisma.client.update({
    where: { id },
    data: {
      nom: data.nom,
      telephone: data.telephone,
      email: toNullable(data.email),
      cin: toNullable(data.cin),
      type: data.type,
      raisonSociale: toNullable(data.raisonSociale),
      ice: toNullable(data.ice),
    },
  });
}

export async function deleteClient(id: string): Promise<void> {
  const client = await prisma.client.findUnique({
    where: { id },
    include: { _count: { select: { vehicules: true } } },
  });

  if (!client) {
    throw new ClientError("Client introuvable");
  }

  if (client._count.vehicules > 0) {
    throw new ClientError(
      "Impossible de supprimer ce client : il possède des véhicules enregistrés",
    );
  }

  await prisma.client.delete({ where: { id } });
}
