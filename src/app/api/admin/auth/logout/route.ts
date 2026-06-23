import { NextResponse } from "next/server";

export async function POST() {
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
