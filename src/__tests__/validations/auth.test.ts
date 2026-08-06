import { describe, it, expect } from "vitest";
import { LoginSchema, UserCreateSchema } from "@/lib/validations/auth";

describe("LoginSchema", () => {
  it("aceita credenciais válidas", () => {
    const r = LoginSchema.safeParse({
      email: "admin@fasesport.com",
      password: "senha123",
    });
    expect(r.success).toBe(true);
  });

  it("rejeita e-mail malformado", () => {
    const r = LoginSchema.safeParse({
      email: "nao-email",
      password: "senha123",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes("email"))).toBe(true);
    }
  });

  it("rejeita senha com menos de 8 caracteres", () => {
    const r = LoginSchema.safeParse({
      email: "admin@fasesport.com",
      password: "123",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes("password"))).toBe(
        true
      );
    }
  });

  it("rejeita payload sem password", () => {
    const r = LoginSchema.safeParse({ email: "admin@fasesport.com" });
    expect(r.success).toBe(false);
  });

  it("rejeita payload sem email", () => {
    const r = LoginSchema.safeParse({ password: "senha123" });
    expect(r.success).toBe(false);
  });
});

describe("UserCreateSchema", () => {
  const base = {
    name: "Vendedor Fase",
    email: "vendedor@fasesport.com",
    password: "senha123",
    role: "T2_VENDEDOR",
  } as const;

  it("aceita payload válido", () => {
    const r = UserCreateSchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it("aceita papel T1_GERENCIA", () => {
    const r = UserCreateSchema.safeParse({ ...base, role: "T1_GERENCIA" });
    expect(r.success).toBe(true);
  });

  it("rejeita e-mail malformado", () => {
    const r = UserCreateSchema.safeParse({ ...base, email: "nao-email" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes("email"))).toBe(true);
    }
  });

  it("rejeita senha com menos de 8 caracteres", () => {
    const r = UserCreateSchema.safeParse({ ...base, password: "123" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes("password"))).toBe(
        true
      );
    }
  });

  it("rejeita papel inválido", () => {
    const r = UserCreateSchema.safeParse({ ...base, role: "T3_GHOST" });
    expect(r.success).toBe(false);
  });

  it("rejeita nome com 1 caractere", () => {
    const r = UserCreateSchema.safeParse({ ...base, name: "V" });
    expect(r.success).toBe(false);
  });
});
