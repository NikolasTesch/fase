import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/ip";
import { loginRatelimit } from "@/lib/ratelimit";
import { getJwtSecret } from "@/lib/auth-jwt";
import { LoginSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    
    try {
      const { success } = await loginRatelimit.limit(`login:${ip}`);
      if (!success) {
        return Response.json(
          { message: "Muitas tentativas. Tente novamente em 15 minutos." },
          { status: 429 }
        );
      }
    } catch (rlError) {
      console.error("[loginRatelimit] Error:", rlError);
      return Response.json(
        { message: "Serviço temporariamente indisponível. Tente novamente." },
        { status: 503 }
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

    if (!user.isActive) {
      return Response.json({ message: "Usuário inativo. Fale com o administrador." }, { status: 401 });
    }

    const token = await new SignJWT({ sub: user.id, email: user.email, role: user.role, isActive: user.isActive })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(getJwtSecret());

    const response = Response.json({ success: true, role: user.role });

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
