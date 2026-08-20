import { z } from "zod";
import { Role } from "@prisma/client";

export const createUserSchema = z.object({
  nom: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().trim().email("Adresse e-mail invalide"),
  role: z.enum(Role),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  nom: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().trim().email("Adresse e-mail invalide"),
  role: z.enum(Role),
  password: z.union([z.literal(""), z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères")]).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
