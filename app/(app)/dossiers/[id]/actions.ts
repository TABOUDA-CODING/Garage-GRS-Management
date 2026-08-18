"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { genererBonDeSortie, regenererBonDeSortie, BsError } from "@/lib/services/bs.service";
import { genererFacture, enregistrerPaiement, FactureError } from "@/lib/services/facture.service";
import { factureSchema, paiementSchema } from "@/lib/validations/facture.validation";

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

export interface GenererFactureState {
  error?: string;
}

export async function genererFactureAction(
  _prevState: GenererFactureState | undefined,
  formData: FormData,
): Promise<GenererFactureState> {
  await requireRole(["RECEPTIONNISTE", "ADMIN"]);

  const dossierId = formData.get("dossierId");
  if (typeof dossierId !== "string") {
    return { error: "Données invalides" };
  }

  const parsed = factureSchema.safeParse({
    montantHT: formData.get("montantHT"),
    tauxTVA: formData.get("tauxTVA"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  try {
    await genererFacture({ dossierId, input: parsed.data });
  } catch (error) {
    if (error instanceof FactureError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath(`/dossiers/${dossierId}`);
  revalidatePath("/factures");
  return {};
}

export interface EnregistrerPaiementState {
  error?: string;
}

export async function enregistrerPaiementAction(
  _prevState: EnregistrerPaiementState | undefined,
  formData: FormData,
): Promise<EnregistrerPaiementState> {
  await requireRole(["RECEPTIONNISTE", "ADMIN"]);

  const dossierId = formData.get("dossierId");
  const factureId = formData.get("factureId");
  if (typeof dossierId !== "string" || typeof factureId !== "string") {
    return { error: "Données invalides" };
  }

  const parsed = paiementSchema.safeParse({
    statutPaiement: formData.get("statutPaiement"),
    modePaiement: formData.get("modePaiement"),
    datePaiement: formData.get("datePaiement"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  try {
    await enregistrerPaiement({ factureId, input: parsed.data });
  } catch (error) {
    if (error instanceof FactureError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath(`/dossiers/${dossierId}`);
  revalidatePath("/factures");
  return {};
}
