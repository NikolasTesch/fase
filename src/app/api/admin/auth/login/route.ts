import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/ip";
import { loginRatelimit } from "@/lib/ratelimit";
import { LoginSchema } from "@/lib/validations/auth";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { success } = await loginRatelimit.limit(`login:${ip}`);

    if (!success) {
      return Response.json(
        { message: "Muitas tentativas. Tente novamente em 15 minutos." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = LoginSchema.safeParse(body);

    if (!validated.success) {
      return Response.json({ message: "Dados inválidos" }, { status: 400 });
    }

    const { email, password } = validated.data;

    const user = await prisma.adminUser.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return Response.json({ message: "Credenciais inválidas" }, { status: 401 });
    }

    const token = await new SignJWT({ sub: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    const response = Response.json({ success: true });

    (response.headers as Headers).append(
      "Set-Cookie",
      `admin_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`
    );

    return response;
  } catch (error) {
    console.error("[POST /api/admin/auth/login]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
