import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/ip";
import { validateCsrf } from "@/lib/csrf";
import { loginRatelimit } from "@/lib/ratelimit";
import { getJwtSecret } from "@/lib/auth-jwt";
import { LoginSchema } from "@/lib/validations/auth";

// Compara contra um hash dummy quando o e-mail não existe para uniformizar o
// tempo de resposta — evita que o timing revele quais e-mails estão cadastrados
let dummyHash: string | null = null;
function getDummyHash(): string {
  if (!dummyHash) dummyHash = bcrypt.hashSync("fase-timing-equalizer", 12);
  return dummyHash;
}

export async function POST(req: NextRequest) {
  try {
    const csrf = validateCsrf(req);
    if (!csrf.valid) {
      return Response.json({ message: "Requisição rejeitada" }, { status: 400 });
    }

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

    const passwordMatches = await bcrypt.compare(
      password,
      user?.passwordHash ?? getDummyHash()
    );

    if (!user || !passwordMatches) {
      return Response.json({ message: "Credenciais inválidas" }, { status: 401 });
    }

    if (!user.isActive) {
      return Response.json({ message: "Usuário inativo. Fale com o administrador." }, { status: 401 });
    }

    const token = await new SignJWT({ sub: user.id, email: user.email, role: user.role, isActive: user.isActive })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(process.env.JWT_EXPIRES_IN || "7d")
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
