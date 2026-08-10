"use server";

import { revalidatePath } from "next/cache";
import { StatutDossier } from "@prisma/client";
import { requireRole } from "@/lib/auth/guards";
import { changerStatutDossier, DossierError } from "@/lib/services/dossier.service";

export interface ChangerStatutState {
  error?: string;
}

export async function changerStatutAction(
  _prevState: ChangerStatutState | undefined,
  formData: FormData,
): Promise<ChangerStatutState> {
  const session = await requireRole(["RECEPTIONNISTE", "TECHNICIEN", "ADMIN"]);

  const dossierId = formData.get("dossierId");
  const statutCible = formData.get("statutCible");

  if (typeof dossierId !== "string" || typeof statutCible !== "string") {
    return { error: "Données invalides" };
  }
  if (!Object.values(StatutDossier).includes(statutCible as StatutDossier)) {
    return { error: "Statut invalide" };
  }

  try {
    await changerStatutDossier({
      dossierId,
      statutCible: statutCible as StatutDossier,
      userId: session.userId,
    });
  } catch (error) {
    if (error instanceof DossierError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/atelier");
  return {};
}
