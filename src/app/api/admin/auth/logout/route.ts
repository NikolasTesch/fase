import { NextRequest, NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  const auth = await requireApiAdmin();
  if (auth instanceof NextResponse) return auth;

  const csrf = validateCsrf(req);
  if (!csrf.valid) {
    return NextResponse.json(
      { message: "Requisição rejeitada" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { success: true },
    {
      headers: {
        "Set-Cookie":
          "admin_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0",
      },
    }
  );
}
