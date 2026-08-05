"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { clientSchema } from "@/lib/validations/client.validation";
import { createClient, updateClient, deleteClient, ClientError } from "@/lib/services/client.service";

export interface ClientFormState {
  error?: string;
}

function parseFormData(formData: FormData) {
  return clientSchema.safeParse({
    nom: formData.get("nom"),
    telephone: formData.get("telephone"),
    email: formData.get("email") ?? "",
    cin: formData.get("cin") ?? "",
    type: formData.get("type"),
    raisonSociale: formData.get("raisonSociale") ?? "",
    ice: formData.get("ice") ?? "",
  });
}

export async function createClientAction(
  _prevState: ClientFormState | undefined,
  formData: FormData,
): Promise<ClientFormState> {
  await requireRole(["RECEPTIONNISTE", "ADMIN"]);

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const client = await createClient(parsed.data);
  redirect(`/clients/${client.id}`);
}

export async function updateClientAction(
  id: string,
  _prevState: ClientFormState | undefined,
  formData: FormData,
): Promise<ClientFormState> {
  await requireRole(["RECEPTIONNISTE", "ADMIN"]);

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  await updateClient(id, parsed.data);
  redirect(`/clients/${id}`);
}

export async function deleteClientAction(id: string): Promise<void> {
  await requireRole(["RECEPTIONNISTE", "ADMIN"]);

  try {
    await deleteClient(id);
  } catch (error) {
    if (error instanceof ClientError) {
      redirect(`/clients/${id}?erreur=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  redirect("/clients");
}
