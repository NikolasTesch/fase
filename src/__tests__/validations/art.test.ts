import { describe, it, expect } from "vitest";
import { ArtSchema } from "@/lib/validations/art";

describe("ArtSchema", () => {
  it("aceita nome válido (≥2 caracteres)", () => {
    const r = ArtSchema.safeParse({ name: "Escudo Corinthians" });
    expect(r.success).toBe(true);
  });

  it("rejeita nome com 1 caractere", () => {
    const r = ArtSchema.safeParse({ name: "E" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes("name"))).toBe(true);
    }
  });

  it("rejeita nome acima de 100 caracteres", () => {
    const r = ArtSchema.safeParse({ name: "a".repeat(101) });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes("name"))).toBe(true);
    }
  });
});
