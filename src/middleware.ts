import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { getJwtSecret } from "@/lib/auth-jwt";

const PROTECTED = ["/admin", "/api/admin"];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  // Login page e endpoint de auth são públicos
  const PUBLIC_PATHS = ["/admin/login", "/api/admin/auth/login"];
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  const token = req.cookies.get("admin_token")?.value;
  const isApiRequest = pathname.startsWith("/api/");

  if (!token) {
    if (isApiRequest) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    await jwtVerify(token, getJwtSecret());
    return NextResponse.next();
  } catch {
    if (isApiRequest) {
      return NextResponse.json({ message: "Sessão expirada" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
