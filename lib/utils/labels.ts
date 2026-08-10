import type { StatutDossier, TypeIntervention, TypeClient } from "@prisma/client";

export const STATUT_DOSSIER_LABELS: Record<StatutDossier, string> = {
  ENTRE: "Entré",
  EN_DIAGNOSTIC: "En diagnostic",
  DEVIS_ENVOYE: "Devis envoyé",
  DEVIS_ACCEPTE: "Devis accepté",
  DEVIS_REFUSE: "Devis refusé",
  EN_COURS: "En cours",
  PRET: "Prêt",
  SORTI: "Sorti",
  ANNULE: "Annulé",
};

export const STATUT_DOSSIER_BADGE_VARIANT: Record<
  StatutDossier,
  "default" | "secondary" | "destructive" | "outline"
> = {
  ENTRE: "outline",
  EN_DIAGNOSTIC: "outline",
  DEVIS_ENVOYE: "outline",
  DEVIS_ACCEPTE: "outline",
  DEVIS_REFUSE: "destructive",
  EN_COURS: "outline",
  PRET: "default",
  SORTI: "secondary",
  ANNULE: "destructive",
};

export const TYPE_INTERVENTION_LABELS: Record<TypeIntervention, string> = {
  DIAGNOSTIC: "Diagnostic",
  REPARATION: "Réparation",
  ENTRETIEN: "Entretien",
  TOLERIE: "Tôlerie / Carrosserie",
};

export const TYPE_CLIENT_LABELS: Record<TypeClient, string> = {
  PARTICULIER: "Particulier",
  ETAT: "État",
  ENTREPRISE: "Entreprise",
};
