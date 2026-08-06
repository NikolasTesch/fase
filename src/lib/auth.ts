import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import type { AdminUser, AdminRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getJwtSecret } from "@/lib/auth-jwt";

export async function getAdminUser(): Promise<AdminUser | null> {
  const token = (await cookies()).get("admin_token")?.value;
  if (!token) return null;

  let payload: { sub?: string };
  try {
    payload = (await jwtVerify(token, getJwtSecret())).payload;
  } catch {
    return null;
  }

  if (!payload.sub) return null;

  const user = await prisma.adminUser.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) return null;

  return user;
}

export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requireApiAdmin(): Promise<AdminUser | NextResponse> {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }
  return user;
}

export function canAccessRoute(role: AdminRole, pathname: string, method: string): boolean {
  if (role === "T1_GERENCIA") {
    return pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  }

  if (role !== "T2_VENDEDOR") return false;

  if (pathname === "/admin/conteudo" || pathname.startsWith("/admin/conteudo/")) return true;
  if (pathname === "/api/admin/art-tags" && method === "GET") return true;
  if (pathname === "/api/admin/arts" && method === "GET") return true;
  if (pathname === "/api/admin/arts/upload" && method === "POST") return true;
  // Ownership (createdById) é checado na rota, não aqui
  if (/^\/api\/admin\/arts\/[^/]+$/.test(pathname) && (method === "PATCH" || method === "DELETE")) return true;
  if (/^\/api\/admin\/arts\/[^/]+\/(preview|download)$/.test(pathname) && method === "GET") return true;
  if (pathname === "/api/admin/auth/logout" && method === "POST") return true;

  return false;
}
