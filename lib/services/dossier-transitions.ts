import { StatutDossier } from "@prisma/client";

export const TRANSITIONS_AUTORISEES: Record<StatutDossier, readonly StatutDossier[]> = {
  ENTRE: [StatutDossier.EN_DIAGNOSTIC, StatutDossier.ANNULE],
  EN_DIAGNOSTIC: [
    StatutDossier.ENTRE,
    StatutDossier.DEVIS_ENVOYE,
    StatutDossier.EN_COURS,
    StatutDossier.ANNULE,
  ],
  DEVIS_ENVOYE: [
    StatutDossier.EN_DIAGNOSTIC,
    StatutDossier.DEVIS_ACCEPTE,
    StatutDossier.DEVIS_REFUSE,
    StatutDossier.ANNULE,
  ],
  DEVIS_ACCEPTE: [StatutDossier.DEVIS_ENVOYE, StatutDossier.EN_COURS, StatutDossier.ANNULE],
  DEVIS_REFUSE: [StatutDossier.DEVIS_ENVOYE, StatutDossier.ANNULE],
  EN_COURS: [StatutDossier.EN_DIAGNOSTIC, StatutDossier.PRET, StatutDossier.ANNULE],
  PRET: [StatutDossier.EN_COURS, StatutDossier.ANNULE],
  // SORTI n'est jamais atteignable manuellement : posé uniquement par le scan du BS (règle métier #1)
  SORTI: [],
  ANNULE: [],
};

export function transitionEstAutorisee(
  statutActuel: StatutDossier,
  statutCible: StatutDossier,
): boolean {
  return TRANSITIONS_AUTORISEES[statutActuel].includes(statutCible);
}
