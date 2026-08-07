"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { vehiculeSchema } from "@/lib/validations/vehicule.validation";
import {
  createVehicule,
  updateVehicule,
  deleteVehicule,
  VehiculeError,
} from "@/lib/services/vehicule.service";

export interface VehiculeFormState {
  error?: string;
}

function parseFormData(formData: FormData) {
  return vehiculeSchema.safeParse({
    immatriculation: formData.get("immatriculation"),
    marque: formData.get("marque"),
    modele: formData.get("modele"),
    annee: formData.get("annee") ?? "",
    couleur: formData.get("couleur") ?? "",
    kilometrage: formData.get("kilometrage") ?? "",
    clientId: formData.get("clientId"),
  });
}

export async function createVehiculeAction(
  _prevState: VehiculeFormState | undefined,
  formData: FormData,
): Promise<VehiculeFormState> {
  await requireRole(["RECEPTIONNISTE", "ADMIN"]);

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  let vehicule;
  try {
    vehicule = await createVehicule(parsed.data);
  } catch (error) {
    if (error instanceof VehiculeError) {
      return { error: error.message };
    }
    throw error;
  }

  redirect(`/vehicules/${vehicule.id}`);
}

export async function updateVehiculeAction(
  id: string,
  _prevState: VehiculeFormState | undefined,
  formData: FormData,
): Promise<VehiculeFormState> {
  await requireRole(["RECEPTIONNISTE", "ADMIN"]);

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  try {
    await updateVehicule(id, parsed.data);
  } catch (error) {
    if (error instanceof VehiculeError) {
      return { error: error.message };
    }
    throw error;
  }

  redirect(`/vehicules/${id}`);
}

export async function deleteVehiculeAction(id: string): Promise<void> {
  await requireRole(["RECEPTIONNISTE", "ADMIN"]);

  try {
    await deleteVehicule(id);
  } catch (error) {
    if (error instanceof VehiculeError) {
      redirect(`/vehicules/${id}?erreur=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  redirect("/vehicules");
}
