import { describe, it, expect, beforeAll } from "vitest";
import { signSession, verifySessionToken } from "./token";

beforeAll(() => {
  process.env.SESSION_SECRET = "test-secret-do-not-use-in-production";
});

describe("signSession / verifySessionToken", () => {
  it("vérifie un token valide et retrouve le payload d'origine", async () => {
    const payload = { userId: "user_1", role: "ADMIN" as const, expiresAt: Date.now() + 60_000 };
    const token = await signSession(payload);
    const verified = await verifySessionToken(token);

    expect(verified).toEqual(payload);
  });

  it("rejette un token dont la signature a été altérée", async () => {
    const payload = { userId: "user_1", role: "ADMIN" as const, expiresAt: Date.now() + 60_000 };
    const token = await signSession(payload);
    const [payloadPart] = token.split(".");
    const tampered = `${payloadPart}.signatureInvalide`;

    expect(await verifySessionToken(tampered)).toBeNull();
  });

  it("rejette un token dont le payload a été modifié après signature", async () => {
    const payload = { userId: "user_1", role: "TECHNICIEN" as const, expiresAt: Date.now() + 60_000 };
    const token = await signSession(payload);
    const [, signaturePart] = token.split(".");
    const forgedPayload = Buffer.from(
      JSON.stringify({ ...payload, role: "ADMIN" }),
    )
      .toString("base64url");
    const forged = `${forgedPayload}.${signaturePart}`;

    expect(await verifySessionToken(forged)).toBeNull();
  });

  it("rejette un token expiré", async () => {
    const payload = { userId: "user_1", role: "VIGILE" as const, expiresAt: Date.now() - 1_000 };
    const token = await signSession(payload);

    expect(await verifySessionToken(token)).toBeNull();
  });

  it("rejette un token malformé", async () => {
    expect(await verifySessionToken("pasunjson")).toBeNull();
    expect(await verifySessionToken("")).toBeNull();
  });
});
