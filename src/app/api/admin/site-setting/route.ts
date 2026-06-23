import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { upsertSiteSetting } from "@/lib/site-settings";
import { validateCsrf } from "@/lib/csrf";
import { getClientIp } from "@/lib/ip";
import { adminRatelimit } from "@/lib/ratelimit";
import { formatZodError, errorResponse } from "@/lib/errors";

const body = z.object({
  key: z.string().min(1),
  value: z.string(),
});

export async function PATCH(req: NextRequest) {
  try {
    // CSRF check
    const csrf = validateCsrf(req);
    if (!csrf.valid) return errorResponse(csrf.reason ?? "Requisição rejeitada", 400);

    // Rate limit
    const ip = getClientIp(req);
    const { success: allowed } = await adminRatelimit.limit(`admin:${ip}`);
    if (!allowed) return errorResponse("Muitas requisições. Tente novamente.", 429);

    const parsed = body.safeParse(await req.json());
    if (!parsed.success) {
      return formatZodError(parsed.error);
    }
    const setting = await upsertSiteSetting(parsed.data.key, parsed.data.value);
    return NextResponse.json(setting);
  } catch (error) {
    console.error("[PATCH /api/admin/site-setting]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
