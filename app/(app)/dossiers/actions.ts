"use server";

import { redirect } from "next/navigation";
import { TypeClient } from "@prisma/client";
import { requireRole } from "@/lib/auth/guards";
import { dossierSchema } from "@/lib/validations/dossier.validation";
import { createDossier, DossierError, type CreateDossierInput } from "@/lib/services/dossier.service";

export interface DossierFormState {
  error?: string;
}

function parseFormData(formData: FormData) {
  return dossierSchema.safeParse({
    mode: formData.get("mode"),
    vehiculeId: formData.get("vehiculeId") ?? "",
    motifDeclare: formData.get("motifDeclare"),
    typesIntervention: formData.getAll("typesIntervention"),
    clientNom: formData.get("clientNom") ?? "",
    clientTelephone: formData.get("clientTelephone") ?? "",
    clientType: formData.get("clientType") || undefined,
    clientRaisonSociale: formData.get("clientRaisonSociale") ?? "",
    clientIce: formData.get("clientIce") ?? "",
    vehiculeImmatriculation: formData.get("vehiculeImmatriculation") ?? "",
    vehiculeMarque: formData.get("vehiculeMarque") ?? "",
    vehiculeModele: formData.get("vehiculeModele") ?? "",
    vehiculeAnnee: formData.get("vehiculeAnnee") ?? "",
    vehiculeCouleur: formData.get("vehiculeCouleur") ?? "",
    vehiculeKilometrage: formData.get("vehiculeKilometrage") ?? "",
  });
}

function toNullable(value: string | undefined): string | null {
  return value && value.length > 0 ? value : null;
}

function toNullableInt(value: string | undefined): number | null {
  return value && value.length > 0 ? Number(value) : null;
}

export async function createDossierAction(
  _prevState: DossierFormState | undefined,
  formData: FormData,
): Promise<DossierFormState> {
  const session = await requireRole(["RECEPTIONNISTE", "ADMIN"]);

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const data = parsed.data;
  const input: CreateDossierInput = {
    mode: data.mode,
    vehiculeId: data.vehiculeId,
    motifDeclare: data.motifDeclare,
    typesIntervention: data.typesIntervention,
    userId: session.userId,
    ...(data.mode === "new"
      ? {
          client: {
            nom: data.clientNom!,
            telephone: data.clientTelephone!,
            type: data.clientType ?? TypeClient.PARTICULIER,
            raisonSociale: toNullable(data.clientRaisonSociale),
            ice: toNullable(data.clientIce),
          },
          vehicule: {
            immatriculation: data.vehiculeImmatriculation!,
            marque: data.vehiculeMarque!,
            modele: data.vehiculeModele!,
            annee: toNullableInt(data.vehiculeAnnee),
            couleur: toNullable(data.vehiculeCouleur),
            kilometrage: toNullableInt(data.vehiculeKilometrage),
          },
        }
      : {}),
  };

  let dossier;
  try {
    dossier = await createDossier(input);
  } catch (error) {
    if (error instanceof DossierError) {
      return { error: error.message };
    }
    throw error;
  }

  redirect(`/dossiers/${dossier.id}`);
}
