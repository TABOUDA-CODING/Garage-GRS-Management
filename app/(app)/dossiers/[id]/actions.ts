"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { genererBonDeSortie, regenererBonDeSortie, BsError } from "@/lib/services/bs.service";

export interface GenererBsState {
  error?: string;
}

export async function genererBsAction(
  _prevState: GenererBsState | undefined,
  formData: FormData,
): Promise<GenererBsState> {
  const session = await requireRole(["ADMIN"]);

  const dossierId = formData.get("dossierId");
  const derogationMotif = formData.get("derogationMotif");
  if (typeof dossierId !== "string") {
    return { error: "Données invalides" };
  }

  try {
    await genererBonDeSortie({
      dossierId,
      adminId: session.userId,
      derogationMotif: typeof derogationMotif === "string" ? derogationMotif : undefined,
    });
  } catch (error) {
    if (error instanceof BsError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath(`/dossiers/${dossierId}`);
  return {};
}

export interface RegenererBsState {
  error?: string;
}

export async function regenererBsAction(
  _prevState: RegenererBsState | undefined,
  formData: FormData,
): Promise<RegenererBsState> {
  const session = await requireRole(["ADMIN"]);

  const dossierId = formData.get("dossierId");
  const ancienBsId = formData.get("bsId");
  if (typeof dossierId !== "string" || typeof ancienBsId !== "string") {
    return { error: "Données invalides" };
  }

  try {
    await regenererBonDeSortie({ dossierId, ancienBsId, adminId: session.userId });
  } catch (error) {
    if (error instanceof BsError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath(`/dossiers/${dossierId}`);
  return {};
}
