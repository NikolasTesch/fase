import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";

const createBody = z.object({
  imageUrl: z.url(),
  linkUrl: z.url(),
  caption: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export async function GET() {
  try {
    const posts = await prisma.instagramPost.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error("[GET /api/admin/instagram]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const existingCount = await prisma.instagramPost.count();
    if (existingCount >= 6) {
      return NextResponse.json(
        { error: "Limite máximo de 6 posts atingido. Remova um post existente antes de adicionar outro." },
        { status: 400 }
      );
    }

    const parsed = createBody.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }
    const post = await prisma.instagramPost.create({ data: parsed.data });
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/instagram]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
