import "server-only";
import { Prisma, StatutPaiement } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { FactureInput, PaiementInput } from "@/lib/validations/facture.validation";
import { calculerMontantTTC } from "./facture-rules";

export class FactureError extends Error {}

const PAGE_SIZE = 10;

async function nextFactureNumero(tx: Prisma.TransactionClient): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FACT-${year}-`;
  const last = await tx.facture.findFirst({
    where: { numero: { startsWith: prefix } },
    orderBy: { numero: "desc" },
    select: { numero: true },
  });
  const nextSeq = last ? Number(last.numero.slice(prefix.length)) + 1 : 1;
  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

export async function genererFacture(params: { dossierId: string; input: FactureInput }) {
  const dossier = await prisma.dossier.findUnique({
    where: { id: params.dossierId },
    include: { _count: { select: { factures: true } } },
  });
  if (!dossier) {
    throw new FactureError("Dossier introuvable");
  }
  if (dossier._count.factures > 0) {
    throw new FactureError("Une facture existe déjà pour ce dossier");
  }

  const montantHT = params.input.montantHT;
  const montantTTC = calculerMontantTTC(montantHT, params.input.tauxTVA);

  return prisma.$transaction(async (tx) => {
    const numero = await nextFactureNumero(tx);

    const facture = await tx.facture.create({
      data: {
        numero,
        dossierId: params.dossierId,
        montantHT,
        tauxTVA: params.input.tauxTVA,
        montantTTC,
        statutPaiement: StatutPaiement.NON_SOLDE,
      },
    });

    await tx.dossier.update({
      where: { id: params.dossierId },
      data: { montantTotal: montantTTC, statutPaiement: StatutPaiement.NON_SOLDE },
    });

    return facture;
  });
}

export async function enregistrerPaiement(params: { factureId: string; input: PaiementInput }) {
  const facture = await prisma.facture.findUnique({ where: { id: params.factureId } });
  if (!facture) {
    throw new FactureError("Facture introuvable");
  }
  if (facture.statutPaiement === StatutPaiement.SOLDE) {
    throw new FactureError("Cette facture est déjà soldée");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.facture.update({
      where: { id: params.factureId },
      data: {
        statutPaiement: params.input.statutPaiement,
        modePaiement: params.input.modePaiement,
        datePaiement: params.input.datePaiement,
      },
    });

    await tx.dossier.update({
      where: { id: facture.dossierId },
      data: { statutPaiement: params.input.statutPaiement },
    });

    return updated;
  });
}

export async function listFactures(params: { statut?: StatutPaiement; page?: number }) {
  const page = params.page && params.page > 0 ? params.page : 1;

  const where: Prisma.FactureWhereInput = params.statut ? { statutPaiement: params.statut } : {};

  const [factures, total] = await Promise.all([
    prisma.facture.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { dossier: { include: { vehicule: { include: { client: true } } } } },
    }),
    prisma.facture.count({ where }),
  ]);

  return {
    factures,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}
