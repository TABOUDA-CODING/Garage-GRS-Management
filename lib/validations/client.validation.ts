import { z } from "zod";
import { TypeClient } from "@prisma/client";

export const clientSchema = z
  .object({
    nom: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères"),
    telephone: z
      .string()
      .trim()
      .min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres")
      .max(20, "Numéro de téléphone invalide"),
    email: z
      .union([z.literal(""), z.string().trim().email("Adresse e-mail invalide")])
      .optional(),
    cin: z.string().trim().optional(),
    type: z.enum(TypeClient),
    raisonSociale: z.string().trim().optional(),
    ice: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if ((data.type === "ETAT" || data.type === "ENTREPRISE") && !data.raisonSociale) {
      ctx.addIssue({
        code: "custom",
        path: ["raisonSociale"],
        message: "La raison sociale est requise pour ce type de client",
      });
    }
    if (data.type === "ENTREPRISE" && !data.ice) {
      ctx.addIssue({
        code: "custom",
        path: ["ice"],
        message: "L'ICE est requis pour une entreprise",
      });
    }
  });

export type ClientInput = z.infer<typeof clientSchema>;
