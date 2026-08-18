import { StatutDossier, type StatutPaiement } from "@prisma/client";

export const DEROGATION_MOTIF_MIN_LENGTH = 10;

export type EligibiliteGeneration =
  | { ok: true; derogationRequise: boolean }
  | { ok: false; error: string };

export function verifierEligibiliteGeneration(
  dossier: { statut: StatutDossier; statutPaiement: StatutPaiement },
  motifDerogation?: string,
): EligibiliteGeneration {
  if (dossier.statut !== StatutDossier.PRET) {
    return { ok: false, error: "Le dossier doit être au statut « Prêt » pour générer un bon de sortie" };
  }

  if (dossier.statutPaiement === "SOLDE") {
    return { ok: true, derogationRequise: false };
  }

  const motif = motifDerogation?.trim() ?? "";
  if (motif.length < DEROGATION_MOTIF_MIN_LENGTH) {
    return {
      ok: false,
      error: `Facture non soldée : un motif de dérogation d'au moins ${DEROGATION_MOTIF_MIN_LENGTH} caractères est requis`,
    };
  }

  return { ok: true, derogationRequise: true };
}
