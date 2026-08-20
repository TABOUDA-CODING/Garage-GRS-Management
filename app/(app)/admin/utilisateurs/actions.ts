"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { createUserSchema, updateUserSchema } from "@/lib/validations/user.validation";
import { createUser, updateUser, setUserActif, UserError } from "@/lib/services/user.service";

export interface UserFormState {
  error?: string;
}

export async function createUserAction(
  _prevState: UserFormState | undefined,
  formData: FormData,
): Promise<UserFormState> {
  await requireRole(["ADMIN"]);

  const parsed = createUserSchema.safeParse({
    nom: formData.get("nom"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  try {
    await createUser(parsed.data);
  } catch (error) {
    if (error instanceof UserError) {
      return { error: error.message };
    }
    throw error;
  }

  redirect("/admin/utilisateurs");
}

export async function updateUserAction(
  id: string,
  _prevState: UserFormState | undefined,
  formData: FormData,
): Promise<UserFormState> {
  await requireRole(["ADMIN"]);

  const parsed = updateUserSchema.safeParse({
    nom: formData.get("nom"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  try {
    await updateUser(id, parsed.data);
  } catch (error) {
    if (error instanceof UserError) {
      return { error: error.message };
    }
    throw error;
  }

  redirect("/admin/utilisateurs");
}

export async function toggleUserActifAction(id: string, actif: boolean): Promise<void> {
  const session = await requireRole(["ADMIN"]);

  if (session.userId === id && !actif) {
    redirect("/admin/utilisateurs?erreur=" + encodeURIComponent("Vous ne pouvez pas désactiver votre propre compte"));
  }

  try {
    await setUserActif(id, actif);
  } catch (error) {
    if (error instanceof UserError) {
      redirect(`/admin/utilisateurs?erreur=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  revalidatePath("/admin/utilisateurs");
}
