import { describe, it, expect } from "vitest";
import { calculerMontantTTC } from "./facture-rules";

describe("calculerMontantTTC", () => {
  it("applique une TVA à 20% sur un montant rond", () => {
    expect(calculerMontantTTC(1000, 20)).toBe(1200);
  });

  it("arrondit le résultat à 2 décimales", () => {
    expect(calculerMontantTTC(99.99, 20)).toBe(119.99);
  });

  it("gère une TVA nulle", () => {
    expect(calculerMontantTTC(500, 0)).toBe(500);
  });

  it("gère des montants avec centimes", () => {
    expect(calculerMontantTTC(123.45, 20)).toBe(148.14);
  });
});
