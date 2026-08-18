import type { StatutBS, StatutDossier, StatutPaiement } from "@prisma/client";

export type RaisonRefus = "INCONNU" | "DEJA_UTILISE" | "NON_PRET" | "IMPAYE";

export type ResultatVerification =
  | { type: "AUTORISE"; derogation: false }
  | { type: "AUTORISE"; derogation: true }
  | { type: "REFUSE"; raison: RaisonRefus };

export const RAISON_REFUS_LABELS: Record<RaisonRefus, string> = {
  INCONNU: "Bon inconnu",
  DEJA_UTILISE: "Bon déjà utilisé",
  NON_PRET: "Véhicule non prêt",
  IMPAYE: "Facture non réglée",
};

export function evaluerVerification(params: {
  bs: { statut: StatutBS; derogationPaiement: boolean } | null;
  dossier: { statut: StatutDossier; statutPaiement: StatutPaiement } | null;
}): ResultatVerification {
  if (!params.bs || !params.dossier) {
    return { type: "REFUSE", raison: "INCONNU" };
  }

  if (params.bs.statut === "UTILISE") {
    return { type: "REFUSE", raison: "DEJA_UTILISE" };
  }
  if (params.bs.statut !== "VALIDE") {
    return { type: "REFUSE", raison: "INCONNU" };
  }

  if (params.dossier.statut !== "PRET") {
    return { type: "REFUSE", raison: "NON_PRET" };
  }

  if (params.dossier.statutPaiement !== "SOLDE" && !params.bs.derogationPaiement) {
    return { type: "REFUSE", raison: "IMPAYE" };
  }

  return { type: "AUTORISE", derogation: params.bs.derogationPaiement };
}
