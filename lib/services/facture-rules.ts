export function arrondi(valeur: number): number {
  return Math.round(valeur * 100) / 100;
}

export function calculerMontantTTC(montantHT: number, tauxTVA: number): number {
  return arrondi(arrondi(montantHT) * (1 + tauxTVA / 100));
}
