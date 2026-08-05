import "server-only";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { getSession } from "./session";
import type { SessionPayload } from "./token";

export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(roles: Role[]): Promise<SessionPayload> {
  const session = await requireUser();
  if (!roles.includes(session.role)) {
    redirect("/dashboard");
  }
  return session;
}
