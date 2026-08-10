import { describe, it, expect } from "vitest";
import { StatutDossier } from "@prisma/client";
import { TRANSITIONS_AUTORISEES, transitionEstAutorisee } from "./dossier-transitions";

describe("transitionEstAutorisee", () => {
  it("autorise le parcours nominal ENTRE -> EN_DIAGNOSTIC -> EN_COURS -> PRET", () => {
    expect(transitionEstAutorisee(StatutDossier.ENTRE, StatutDossier.EN_DIAGNOSTIC)).toBe(true);
    expect(transitionEstAutorisee(StatutDossier.EN_DIAGNOSTIC, StatutDossier.EN_COURS)).toBe(true);
    expect(transitionEstAutorisee(StatutDossier.EN_COURS, StatutDossier.PRET)).toBe(true);
  });

  it("autorise le parcours avec devis", () => {
    expect(transitionEstAutorisee(StatutDossier.EN_DIAGNOSTIC, StatutDossier.DEVIS_ENVOYE)).toBe(true);
    expect(transitionEstAutorisee(StatutDossier.DEVIS_ENVOYE, StatutDossier.DEVIS_ACCEPTE)).toBe(true);
    expect(transitionEstAutorisee(StatutDossier.DEVIS_ENVOYE, StatutDossier.DEVIS_REFUSE)).toBe(true);
    expect(transitionEstAutorisee(StatutDossier.DEVIS_ACCEPTE, StatutDossier.EN_COURS)).toBe(true);
  });

  it("rejette les sauts d'étapes", () => {
    expect(transitionEstAutorisee(StatutDossier.ENTRE, StatutDossier.EN_COURS)).toBe(false);
    expect(transitionEstAutorisee(StatutDossier.ENTRE, StatutDossier.PRET)).toBe(false);
    expect(transitionEstAutorisee(StatutDossier.EN_DIAGNOSTIC, StatutDossier.PRET)).toBe(false);
  });

  it("n'autorise jamais SORTI comme cible manuelle, quel que soit le statut de départ", () => {
    for (const statut of Object.values(StatutDossier)) {
      expect(transitionEstAutorisee(statut, StatutDossier.SORTI)).toBe(false);
    }
  });

  it("permet l'annulation depuis tout statut actif", () => {
    const statutsActifs = Object.values(StatutDossier).filter(
      (statut) => statut !== StatutDossier.SORTI && statut !== StatutDossier.ANNULE,
    );
    for (const statut of statutsActifs) {
      expect(transitionEstAutorisee(statut, StatutDossier.ANNULE)).toBe(true);
    }
  });

  it("SORTI et ANNULE sont des statuts terminaux sans transition sortante", () => {
    expect(TRANSITIONS_AUTORISEES[StatutDossier.SORTI]).toHaveLength(0);
    expect(TRANSITIONS_AUTORISEES[StatutDossier.ANNULE]).toHaveLength(0);
  });

  it("permet de revenir en arrière pour corriger un avancement erroné", () => {
    expect(transitionEstAutorisee(StatutDossier.PRET, StatutDossier.EN_COURS)).toBe(true);
    expect(transitionEstAutorisee(StatutDossier.EN_COURS, StatutDossier.EN_DIAGNOSTIC)).toBe(true);
  });

  it("rejette une transition vers le même statut", () => {
    expect(transitionEstAutorisee(StatutDossier.EN_COURS, StatutDossier.EN_COURS)).toBe(false);
  });
});
