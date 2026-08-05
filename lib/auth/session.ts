import "server-only";
import { cookies } from "next/headers";
import type { Role } from "@prisma/client";
import { SESSION_COOKIE_NAME, signSession, verifySessionToken, type SessionPayload } from "./token";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

export async function createSession(userId: string, role: Role): Promise<void> {
  const payload: SessionPayload = {
    userId,
    role,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };
  const token = await signSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(payload.expiresAt),
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
