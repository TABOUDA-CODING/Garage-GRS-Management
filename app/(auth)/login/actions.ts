"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validations/auth.validation";
import { login, AuthError } from "@/lib/services/auth.service";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prevState: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  try {
    await login(parsed.data.email, parsed.data.password);
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.message };
    }
    throw error;
  }

  redirect("/dashboard");
}
