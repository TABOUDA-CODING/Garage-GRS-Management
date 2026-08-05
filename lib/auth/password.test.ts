import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("hashPassword / verifyPassword", () => {
  it("valide le bon mot de passe après hachage", async () => {
    const hash = await hashPassword("password123");
    expect(await verifyPassword("password123", hash)).toBe(true);
  });

  it("rejette un mauvais mot de passe", async () => {
    const hash = await hashPassword("password123");
    expect(await verifyPassword("mauvais-mot-de-passe", hash)).toBe(false);
  });

  it("produit un hash différent du mot de passe en clair", async () => {
    const hash = await hashPassword("password123");
    expect(hash).not.toBe("password123");
  });
});
