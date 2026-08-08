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
});

describe("canAccessRoute — T2_VENDEDOR", () => {
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

  it("bloqueia /admin/conteudo (página removida)", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/admin/conteudo", "GET")).toBe(false);
  });

  it("bloqueia subpaths de /admin/conteudo/", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/admin/conteudo/x", "GET")).toBe(false);
  });

  it("bloqueia GET /api/admin/users", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/users", "GET")).toBe(false);
  });

  it("bloqueia GET /api/admin/arts (rotas removidas)", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/arts", "GET")).toBe(false);
  });

  it("bloqueia POST /api/admin/arts/upload", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/arts/upload", "POST")).toBe(false);
  });

  it("bloqueia PATCH /api/admin/arts/abc", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/arts/abc", "PATCH")).toBe(false);
  });

  it("bloqueia DELETE /api/admin/arts/abc", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/arts/abc", "DELETE")).toBe(false);
  });

  it("bloqueia GET /api/admin/arts/abc/preview", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/arts/abc/preview", "GET")).toBe(false);
  });

  it("bloqueia GET /api/admin/arts/abc/download", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/arts/abc/download", "GET")).toBe(false);
  });

  it("bloqueia GET /api/admin/art-tags (rotas removidas)", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/art-tags", "GET")).toBe(false);
  });

  it("bloqueia POST /api/admin/art-tags", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/art-tags", "POST")).toBe(false);
  });

  it("bloqueia PATCH /api/admin/art-tags/1", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/art-tags/1", "PATCH")).toBe(false);
  });

  it("bloqueia DELETE /api/admin/art-tags/1", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/art-tags/1", "DELETE")).toBe(false);
  });

  it("bloqueia POST /api/admin/auth/login (logout é a única ação permitida)", () => {
    expect(canAccessRoute("T2_VENDEDOR", "/api/admin/auth/login", "POST")).toBe(false);
  });
});
