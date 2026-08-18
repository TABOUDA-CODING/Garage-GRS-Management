import "server-only";
import { startOfDay, startOfMonth, startOfWeek, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { StatutDossier } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const STAGNATION_JOURS = 3;

export const STATUTS_ACTIFS = Object.values(StatutDossier).filter(
  (statut) => statut !== StatutDossier.SORTI && statut !== StatutDossier.ANNULE,
);

export async function getDashboardData() {
  const now = new Date();
  const seuilStagnation = subDays(now, STAGNATION_JOURS);
  const debutJour = startOfDay(now);
  const debutSemaine = startOfWeek(now, { locale: fr });
  const debutMois = startOfMonth(now);

  const [
    comptagesBruts,
    sortiesDuJour,
    dossiersStagnants,
    facturesImpayees,
    devisSansReponse,
    caJour,
    caSemaine,
    caMois,
  ] = await Promise.all([
    prisma.dossier.groupBy({
      by: ["statut"],
      where: { statut: { in: STATUTS_ACTIFS } },
      _count: true,
    }),
    prisma.dossier.count({
      where: { dateSortieReelle: { gte: debutJour } },
    }),
    prisma.dossier.findMany({
      where: { statut: { in: STATUTS_ACTIFS }, updatedAt: { lt: seuilStagnation } },
      orderBy: { updatedAt: "asc" },
      include: { vehicule: { include: { client: true } } },
    }),
    prisma.facture.findMany({
      where: { statutPaiement: { not: "SOLDE" } },
      orderBy: { createdAt: "asc" },
      include: { dossier: { include: { vehicule: { include: { client: true } } } } },
    }),
    prisma.dossier.findMany({
      where: { statut: StatutDossier.DEVIS_ENVOYE },
      orderBy: { updatedAt: "asc" },
      include: { vehicule: { include: { client: true } } },
    }),
    prisma.facture.aggregate({
      _sum: { montantTTC: true },
      where: { statutPaiement: "SOLDE", datePaiement: { gte: debutJour } },
    }),
    prisma.facture.aggregate({
      _sum: { montantTTC: true },
      where: { statutPaiement: "SOLDE", datePaiement: { gte: debutSemaine } },
    }),
    prisma.facture.aggregate({
      _sum: { montantTTC: true },
      where: { statutPaiement: "SOLDE", datePaiement: { gte: debutMois } },
    }),
  ]);

  const comptagesParStatut = STATUTS_ACTIFS.map((statut) => ({
    statut,
    count: comptagesBruts.find((c) => c.statut === statut)?._count ?? 0,
  }));

  return {
    comptagesParStatut,
    vehiculesPresents: comptagesParStatut.reduce((total, c) => total + c.count, 0),
    sortiesDuJour,
    dossiersStagnants,
    facturesImpayees,
    devisSansReponse,
    ca: {
      jour: caJour._sum.montantTTC?.toNumber() ?? 0,
      semaine: caSemaine._sum.montantTTC?.toNumber() ?? 0,
      mois: caMois._sum.montantTTC?.toNumber() ?? 0,
    },
  };
}
