import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/admin", "/api/admin"];
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  const isProtected = PROTECTED.some((p) =>
    req.nextUrl.pathname.startsWith(p)
  );

  if (!isProtected) return NextResponse.next();

  // Login page e endpoint de auth são públicos
  const PUBLIC_PATHS = ["/admin/login", "/api/admin/auth/login"];
  if (PUBLIC_PATHS.includes(req.nextUrl.pathname)) return NextResponse.next();

  const token = req.cookies.get("admin_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
