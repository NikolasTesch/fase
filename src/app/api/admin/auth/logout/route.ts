import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth";

export async function POST() {
  const auth = await requireApiAdmin();
  if (auth instanceof NextResponse) return auth;

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
