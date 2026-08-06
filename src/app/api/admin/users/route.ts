import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireApiAdmin, canAccessRoute } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { getClientIp } from "@/lib/ip";
import { adminRatelimit } from "@/lib/ratelimit";
import { UserCreateSchema } from "@/lib/validations/auth";
import { formatZodError, errorResponse } from "@/lib/errors";

export const dynamic = "force-dynamic";

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;

export async function GET(req: NextRequest) {
  try {
    const auth = await requireApiAdmin();
    if (auth instanceof NextResponse) return auth;
    if (!canAccessRoute(auth.role, req.nextUrl.pathname, "GET")) {
      return errorResponse("Acesso negado", 403);
    }

    const users = await prisma.adminUser.findMany({
      select: userSelect,
      orderBy: { createdAt: "desc" },
    });

    return Response.json(users);
  } catch (error) {
    console.error("[GET /api/admin/users]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiAdmin();
    if (auth instanceof NextResponse) return auth;
    if (!canAccessRoute(auth.role, req.nextUrl.pathname, "POST")) {
      return errorResponse("Acesso negado", 403);
    }

    const csrf = validateCsrf(req);
    if (!csrf.valid) return errorResponse(csrf.reason ?? "Requisição rejeitada", 400);

    const ip = getClientIp(req);
    const { success: allowed } = await adminRatelimit.limit(`admin:${ip}`);
    if (!allowed) return errorResponse("Muitas requisições. Tente novamente.", 429);

    const body = await req.json();
    const validated = UserCreateSchema.safeParse(body);
    if (!validated.success) return formatZodError(validated.error);

    const { name, email, password, role } = validated.data;
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.adminUser.create({
      data: { name, email, passwordHash, role },
      select: userSelect,
    });

    return Response.json(user, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json({ message: "E-mail já cadastrado" }, { status: 409 });
    }
    console.error("[POST /api/admin/users]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
