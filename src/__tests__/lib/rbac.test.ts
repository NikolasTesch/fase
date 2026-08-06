import { describe, it, expect } from "vitest";
import { canAccessRoute } from "@/lib/auth";

describe("canAccessRoute — T1_GERENCIA", () => {
  it("libera /admin/dashboard", () => {
    expect(canAccessRoute("T1_GERENCIA", "/admin/dashboard", "GET")).toBe(true);
  });

  it("libera /admin/produtos", () => {
    expect(canAccessRoute("T1_GERENCIA", "/admin/produtos", "GET")).toBe(true);
  });

  it("libera POST /api/admin/users", () => {
    expect(canAccessRoute("T1_GERENCIA", "/api/admin/users", "POST")).toBe(true);
  });

  it("libera DELETE /api/admin/art-tags", () => {
    expect(canAccessRoute("T1_GERENCIA", "/api/admin/art-tags", "DELETE")).toBe(true);
  });
});

describe("canAccessRoute — T2_VENDEDOR", () => {
  it("libera /admin/conteudo", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/admin/conteudo", "GET")).toBe(true);
  });

  it("libera subpaths de /admin/conteudo/", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/admin/conteudo/x", "GET")).toBe(true);
  });

  it("libera GET /api/admin/art-tags", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/art-tags", "GET")).toBe(true);
  });

  it("libera GET /api/admin/arts", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/arts", "GET")).toBe(true);
  });

  it("libera POST /api/admin/arts/upload", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/arts/upload", "POST")).toBe(true);
  });

  it("libera GET /api/admin/arts/abc/download", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/arts/abc/download", "GET")).toBe(true);
  });

  it("libera GET /api/admin/arts/abc/preview", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/arts/abc/preview", "GET")).toBe(true);
  });

  it("libera PATCH /api/admin/arts/abc", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/arts/abc", "PATCH")).toBe(true);
  });

  it("libera DELETE /api/admin/arts/abc (ownership é checado na rota via createdById, não aqui)", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/arts/abc", "DELETE")).toBe(true);
  });

  it("libera POST /api/admin/auth/logout", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/auth/logout", "POST")).toBe(true);
  });

  it("bloqueia /admin/dashboard", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/admin/dashboard", "GET")).toBe(false);
  });

  it("bloqueia /admin/produtos", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/admin/produtos", "GET")).toBe(false);
  });

  it("bloqueia /admin/usuarios", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/admin/usuarios", "GET")).toBe(false);
  });

  it("bloqueia GET /api/admin/users", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/users", "GET")).toBe(false);
  });

  it("bloqueia PATCH /api/admin/art-tags/1", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/art-tags/1", "PATCH")).toBe(false);
  });

  it("bloqueia POST /api/admin/art-tags (mutação é T1-only)", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/art-tags", "POST")).toBe(false);
  });

  it("bloqueia POST /api/admin/arts (rota de criação é /upload)", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/arts", "POST")).toBe(false);
  });

  it("bloqueia GET /api/admin/arts/abc/outro (4º segmento fora de preview|download)", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/arts/abc/outro", "GET")).toBe(false);
  });
});
