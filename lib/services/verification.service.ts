import "server-only";
import { StatutBS, StatutDossier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { evaluerVerification, type ResultatVerification } from "./verification-rules";

export interface VerificationResponse {
  resultat: ResultatVerification;
  vehicule: { immatriculation: string; marque: string; modele: string } | null;
  client: { nom: string } | null;
  derogeParNom: string | null;
}

export async function verifierEtConsommerBs(code: string, vigileId: string): Promise<VerificationResponse> {
  const trimmed = code.trim();
  if (!trimmed) {
    return { resultat: { type: "REFUSE", raison: "INCONNU" }, vehicule: null, client: null, derogeParNom: null };
  }

  const bs = await prisma.bonDeSortie.findFirst({
    where: { OR: [{ qrToken: trimmed }, { numero: trimmed }] },
    include: {
      dossier: { include: { vehicule: { include: { client: true } } } },
      derogationPar: true,
    },
  });

  if (!bs) {
    return { resultat: { type: "REFUSE", raison: "INCONNU" }, vehicule: null, client: null, derogeParNom: null };
  }

  const contexte = {
    vehicule: {
      immatriculation: bs.dossier.vehicule.immatriculation,
      marque: bs.dossier.vehicule.marque,
      modele: bs.dossier.vehicule.modele,
    },
    client: { nom: bs.dossier.vehicule.client.nom },
    derogeParNom: bs.derogationPar?.nom ?? null,
  };

  const evaluation = evaluerVerification({ bs, dossier: bs.dossier });

  if (evaluation.type === "REFUSE") {
    return { resultat: evaluation, ...contexte };
  }

  // Transaction atomique : le BS n'est marqué UTILISE que si son statut est encore VALIDE
  // au moment de l'update, ce qui empêche deux scans simultanés d'autoriser deux sorties.
  const consomme = await prisma.$transaction(async (tx) => {
    const update = await tx.bonDeSortie.updateMany({
      where: { id: bs.id, statut: StatutBS.VALIDE },
      data: { statut: StatutBS.UTILISE, dateUtilisation: new Date() },
    });
    if (update.count === 0) {
      return false;
    }

    await tx.dossier.update({
      where: { id: bs.dossierId },
      data: {
        statut: StatutDossier.SORTI,
        dateSortieReelle: new Date(),
        historique: {
          create: {
            statutAvant: StatutDossier.PRET,
            statutApres: StatutDossier.SORTI,
            userId: vigileId,
            commentaire: `Sortie autorisée via bon ${bs.numero}`,
          },
        },
      },
    });

    return true;
  });

  if (!consomme) {
    return { resultat: { type: "REFUSE", raison: "DEJA_UTILISE" }, ...contexte };
  }

  return { resultat: evaluation, ...contexte };
}
