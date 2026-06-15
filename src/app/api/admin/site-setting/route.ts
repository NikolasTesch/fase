import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { upsertSiteSetting } from "@/lib/site-settings";

const body = z.object({
  key: z.string().min(1),
  value: z.string(),
});

export async function PATCH(req: NextRequest) {
  try {
    const parsed = body.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }
    const setting = await upsertSiteSetting(parsed.data.key, parsed.data.value);
    return NextResponse.json(setting);
  } catch (error) {
    console.error("[PATCH /api/admin/site-setting]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
