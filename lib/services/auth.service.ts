import "server-only";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";

export class AuthError extends Error {}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.actif) {
    throw new AuthError("Email ou mot de passe incorrect");
  }

  const passwordValid = await verifyPassword(password, user.passwordHash);
  if (!passwordValid) {
    throw new AuthError("Email ou mot de passe incorrect");
  }

  await createSession(user.id, user.role);

  return { id: user.id, nom: user.nom, role: user.role };
}

export async function logout(): Promise<void> {
  await destroySession();
}
