import { z } from "zod";
import { ModePaiement } from "@prisma/client";

export const factureSchema = z.object({
  montantHT: z.coerce.number().positive("Le montant HT doit être positif"),
  tauxTVA: z.coerce.number().min(0, "La TVA ne peut pas être négative").max(100, "TVA invalide"),
});

export type FactureInput = z.infer<typeof factureSchema>;

export const paiementSchema = z.object({
  statutPaiement: z.enum(["PARTIEL", "SOLDE"]),
  modePaiement: z.enum(ModePaiement),
  datePaiement: z.coerce.date(),
});

export type PaiementInput = z.infer<typeof paiementSchema>;
