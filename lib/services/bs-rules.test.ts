import { describe, it, expect } from "vitest";
import { StatutDossier } from "@prisma/client";
import { DEROGATION_MOTIF_MIN_LENGTH, verifierEligibiliteGeneration } from "./bs-rules";

describe("verifierEligibiliteGeneration", () => {
  it("refuse la génération si le dossier n'est pas au statut PRET", () => {
    const result = verifierEligibiliteGeneration({
      statut: StatutDossier.EN_COURS,
      statutPaiement: "SOLDE",
    });
    expect(result.ok).toBe(false);
  });

  it("autorise sans dérogation quand le dossier est prêt et soldé", () => {
    const result = verifierEligibiliteGeneration({
      statut: StatutDossier.PRET,
      statutPaiement: "SOLDE",
    });
    expect(result).toEqual({ ok: true, derogationRequise: false });
  });

  it("refuse sans motif de dérogation quand le paiement n'est pas soldé", () => {
    const result = verifierEligibiliteGeneration({
      statut: StatutDossier.PRET,
      statutPaiement: "NON_SOLDE",
    });
    expect(result.ok).toBe(false);
  });

  it("refuse un motif de dérogation trop court", () => {
    const result = verifierEligibiliteGeneration(
      { statut: StatutDossier.PRET, statutPaiement: "PARTIEL" },
      "trop bref",
    );
    expect(result.ok).toBe(false);
  });

  it(`accepte un motif d'au moins ${DEROGATION_MOTIF_MIN_LENGTH} caractères`, () => {
    const result = verifierEligibiliteGeneration(
      { statut: StatutDossier.PRET, statutPaiement: "NON_SOLDE" },
      "Client prioritaire, paiement à réception de facture",
    );
    expect(result).toEqual({ ok: true, derogationRequise: true });
  });

  it("ignore les espaces superflus dans le motif", () => {
    const result = verifierEligibiliteGeneration(
      { statut: StatutDossier.PRET, statutPaiement: "NON_SOLDE" },
      "   court   ",
    );
    expect(result.ok).toBe(false);
  });
});
