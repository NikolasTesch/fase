import { describe, it, expect } from "vitest";
import {
  ArtUploadSchema,
  ArtUpdateSchema,
  ArtTagSchema,
} from "@/lib/validations/arts";

describe("ArtUploadSchema", () => {
  it("aceita payload válido", () => {
    const r = ArtUploadSchema.safeParse({
      name: "Escudo Corinthinhas",
      description: "Versão em alta resolução",
      tagIds: ["clxabc1230000abcdefghijkl"],
    });
    expect(r.success).toBe(true);
  });

  it("rejeita nome com menos de 2 caracteres", () => {
    const r = ArtUploadSchema.safeParse({ name: "E" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes("name"))).toBe(true);
    }
  });

  it("rejeita tagIds inválida", () => {
    const r = ArtUploadSchema.safeParse({
      name: "Escudo",
      tagIds: ["nao-e-um-cuid"],
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes("tagIds"))).toBe(true);
    }
  });

  it("default de tagIds é lista vazia", () => {
    const r = ArtUploadSchema.safeParse({ name: "Escudo" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.tagIds).toEqual([]);
    }
  });
});

describe("ArtUpdateSchema", () => {
  it("aceita payload parcial vazio", () => {
    const r = ArtUpdateSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("aceita description null para limpar", () => {
    const r = ArtUpdateSchema.safeParse({ description: null });
    expect(r.success).toBe(true);
  });

  it("rejeita tagIds inválida", () => {
    const r = ArtUpdateSchema.safeParse({ tagIds: ["x"] });
    expect(r.success).toBe(false);
  });
});

describe("ArtTagSchema", () => {
  it("aceita nome válido", () => {
    const r = ArtTagSchema.safeParse({ name: "Futebol" });
    expect(r.success).toBe(true);
  });

  it("rejeita nome com 1 caractere", () => {
    const r = ArtTagSchema.safeParse({ name: "F" });
    expect(r.success).toBe(false);
  });

  it("rejeita nome acima de 50 caracteres", () => {
    const r = ArtTagSchema.safeParse({ name: "a".repeat(51) });
    expect(r.success).toBe(false);
  });
});
