import { z } from "zod";
import { TypeClient, TypeIntervention } from "@prisma/client";

export const dossierSchema = z
  .object({
    mode: z.enum(["existing", "new"]),
    vehiculeId: z.string().trim().optional(),
    motifDeclare: z.string().trim().min(5, "Le motif doit contenir au moins 5 caractères"),
    typesIntervention: z
      .array(z.enum(TypeIntervention))
      .min(1, "Sélectionnez au moins un type d'intervention"),
    clientNom: z.string().trim().optional(),
    clientTelephone: z.string().trim().optional(),
    clientType: z.enum(TypeClient).optional(),
    clientRaisonSociale: z.string().trim().optional(),
    clientIce: z.string().trim().optional(),
    vehiculeImmatriculation: z.string().trim().optional(),
    vehiculeMarque: z.string().trim().optional(),
    vehiculeModele: z.string().trim().optional(),
    vehiculeAnnee: z.string().trim().optional(),
    vehiculeCouleur: z.string().trim().optional(),
    vehiculeKilometrage: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "existing") {
      if (!data.vehiculeId) {
        ctx.addIssue({ code: "custom", path: ["vehiculeId"], message: "Sélectionnez un véhicule" });
      }
      return;
    }

    if (!data.clientNom || data.clientNom.length < 2) {
      ctx.addIssue({ code: "custom", path: ["clientNom"], message: "Le nom du client est requis" });
    }
    if (!data.clientTelephone || data.clientTelephone.length < 10) {
      ctx.addIssue({
        code: "custom",
        path: ["clientTelephone"],
        message: "Le téléphone du client est requis",
      });
    }
    if (!data.vehiculeImmatriculation || data.vehiculeImmatriculation.length < 4) {
      ctx.addIssue({
        code: "custom",
        path: ["vehiculeImmatriculation"],
        message: "L'immatriculation est requise",
      });
    }
    if (!data.vehiculeMarque) {
      ctx.addIssue({ code: "custom", path: ["vehiculeMarque"], message: "La marque est requise" });
    }
    if (!data.vehiculeModele) {
      ctx.addIssue({ code: "custom", path: ["vehiculeModele"], message: "Le modèle est requis" });
    }
    if ((data.clientType === "ETAT" || data.clientType === "ENTREPRISE") && !data.clientRaisonSociale) {
      ctx.addIssue({
        code: "custom",
        path: ["clientRaisonSociale"],
        message: "La raison sociale est requise pour ce type de client",
      });
    }
    if (data.clientType === "ENTREPRISE" && !data.clientIce) {
      ctx.addIssue({ code: "custom", path: ["clientIce"], message: "L'ICE est requis pour une entreprise" });
    }
  });

export type DossierInput = z.infer<typeof dossierSchema>;
