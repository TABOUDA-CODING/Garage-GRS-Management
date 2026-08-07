import { z } from "zod";

const currentYear = new Date().getFullYear();

export const vehiculeSchema = z.object({
  immatriculation: z
    .string()
    .trim()
    .min(4, "L'immatriculation doit contenir au moins 4 caractères"),
  marque: z.string().trim().min(1, "La marque est requise"),
  modele: z.string().trim().min(1, "Le modèle est requis"),
  annee: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || (/^\d{4}$/.test(val) && Number(val) >= 1950 && Number(val) <= currentYear + 1),
      "Année invalide",
    ),
  couleur: z.string().trim().optional(),
  kilometrage: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^\d+$/.test(val), "Le kilométrage doit être un nombre positif"),
  clientId: z.string().trim().min(1, "Le client est requis"),
});

export type VehiculeInput = z.infer<typeof vehiculeSchema>;
