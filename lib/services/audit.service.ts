import "server-only";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export async function listHistorique(params: { page?: number }) {
  const page = params.page && params.page > 0 ? params.page : 1;

  const [entries, total] = await Promise.all([
    prisma.historiqueStatut.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { nom: true } },
        dossier: { select: { numero: true, vehicule: { select: { immatriculation: true } } } },
      },
    }),
    prisma.historiqueStatut.count(),
  ]);

  return {
    entries,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}
