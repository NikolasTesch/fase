import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";

const patchBody = z.object({
  imageUrl: z.string().url().optional(),
  linkUrl: z.string().url().optional(),
  caption: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsed = patchBody.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }
    const post = await prisma.instagramPost.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(post);
  } catch (error) {
    console.error("[PATCH /api/admin/instagram/:id]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.instagramPost.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/admin/instagram/:id]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
