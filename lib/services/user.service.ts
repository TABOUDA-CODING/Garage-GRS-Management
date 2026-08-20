import "server-only";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import type { CreateUserInput, UpdateUserInput } from "@/lib/validations/user.validation";

export class UserError extends Error {}

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { nom: "asc" },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(data: CreateUserInput) {
  const existant = await prisma.user.findUnique({ where: { email: data.email } });
  if (existant) {
    throw new UserError("Un utilisateur avec cet e-mail existe déjà");
  }

  const passwordHash = await hashPassword(data.password);
  return prisma.user.create({
    data: {
      nom: data.nom,
      email: data.email,
      role: data.role,
      passwordHash,
    },
  });
}

export async function updateUser(id: string, data: UpdateUserInput) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new UserError("Utilisateur introuvable");
  }

  const autre = await prisma.user.findUnique({ where: { email: data.email } });
  if (autre && autre.id !== id) {
    throw new UserError("Un utilisateur avec cet e-mail existe déjà");
  }

  return prisma.user.update({
    where: { id },
    data: {
      nom: data.nom,
      email: data.email,
      role: data.role,
      ...(data.password ? { passwordHash: await hashPassword(data.password) } : {}),
    },
  });
}

export async function setUserActif(id: string, actif: boolean): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new UserError("Utilisateur introuvable");
  }

  await prisma.user.update({ where: { id }, data: { actif } });
}
