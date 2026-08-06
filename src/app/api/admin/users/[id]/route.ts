import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireApiAdmin, canAccessRoute } from "@/lib/auth";
import { UserUpdateSchema } from "@/lib/validations/auth";
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

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;

    const auth = await requireApiAdmin();
    if (auth instanceof NextResponse) return auth;
    if (!canAccessRoute(auth.role, req.nextUrl.pathname, "PATCH")) {
      return errorResponse("Acesso negado", 403);
    }

    const body = await req.json();
    const validated = UserUpdateSchema.safeParse(body);
    if (!validated.success) return formatZodError(validated.error);

    const { password, ...data } = validated.data;

    if (id === auth.id && data.isActive === false) {
      return errorResponse("Você não pode desativar a si mesmo", 403);
    }

    const user = await prisma.adminUser.update({
      where: { id },
      data: {
        ...data,
        ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
      },
      select: userSelect,
    });

    return Response.json(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json({ message: "E-mail já cadastrado" }, { status: 409 });
    }
    console.error("[PATCH /api/admin/users/[id]]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
