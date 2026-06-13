import { describe, it, expect } from "vitest";
import { LoginSchema } from "@/lib/validations/auth";

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
