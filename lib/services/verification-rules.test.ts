import { describe, it, expect } from "vitest";
import { evaluerVerification } from "./verification-rules";

describe("evaluerVerification", () => {
  it("refuse un bon inconnu", () => {
    expect(evaluerVerification({ bs: null, dossier: null })).toEqual({ type: "REFUSE", raison: "INCONNU" });
  });

  it("refuse un bon déjà utilisé", () => {
    const result = evaluerVerification({
      bs: { statut: "UTILISE", derogationPaiement: false },
      dossier: { statut: "SORTI", statutPaiement: "SOLDE" },
    });
    expect(result).toEqual({ type: "REFUSE", raison: "DEJA_UTILISE" });
  });

  it("refuse un bon annulé comme inconnu", () => {
    const result = evaluerVerification({
      bs: { statut: "ANNULE", derogationPaiement: false },
      dossier: { statut: "PRET", statutPaiement: "SOLDE" },
    });
    expect(result).toEqual({ type: "REFUSE", raison: "INCONNU" });
  });

  it("refuse si le dossier n'est plus prêt malgré un bon valide", () => {
    const result = evaluerVerification({
      bs: { statut: "VALIDE", derogationPaiement: false },
      dossier: { statut: "EN_COURS", statutPaiement: "SOLDE" },
    });
    expect(result).toEqual({ type: "REFUSE", raison: "NON_PRET" });
  });

  it("refuse si la facture n'est pas soldée et qu'aucune dérogation n'a été accordée", () => {
    const result = evaluerVerification({
      bs: { statut: "VALIDE", derogationPaiement: false },
      dossier: { statut: "PRET", statutPaiement: "NON_SOLDE" },
    });
    expect(result).toEqual({ type: "REFUSE", raison: "IMPAYE" });
  });

  it("autorise sans mention de dérogation quand tout est en ordre", () => {
    const result = evaluerVerification({
      bs: { statut: "VALIDE", derogationPaiement: false },
      dossier: { statut: "PRET", statutPaiement: "SOLDE" },
    });
    expect(result).toEqual({ type: "AUTORISE", derogation: false });
  });

  it("autorise avec dérogation même si la facture n'est pas soldée", () => {
    const result = evaluerVerification({
      bs: { statut: "VALIDE", derogationPaiement: true },
      dossier: { statut: "PRET", statutPaiement: "NON_SOLDE" },
    });
    expect(result).toEqual({ type: "AUTORISE", derogation: true });
  });
});
