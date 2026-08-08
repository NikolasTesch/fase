import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { validateCsrf } from "@/lib/csrf";
import { getClientIp } from "@/lib/ip";
import { adminRatelimit } from "@/lib/ratelimit";
import { formatZodError, errorResponse } from "@/lib/errors";
import { requireT1Admin } from "@/lib/auth";
import { revalidateCatalog } from "@/lib/revalidate";

const ProductSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  fabric: z.string().optional(),
  minQty: z.number().int().min(1).default(10),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
  simulatorUrl: z.url().optional().or(z.literal("")),
  sortOrder: z.number().int().default(0),
  categoryId: z.string().min(1),
  subcategoryId: z.string().optional().nullable(),
  artId: z.string().cuid().optional().nullable(),
});

export async function GET() {
  const auth = await requireT1Admin();
  if (auth instanceof NextResponse) return auth;

  try {
    const products = await prisma.product.findMany({
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      include: {
        category: { select: { slug: true, name: true } },
        subcategory: { select: { slug: true, name: true } },
        images: { where: { isPrimary: true }, take: 1 },
      },
    });

    return Response.json(products);
  } catch (error) {
    console.error("[GET /api/admin/products]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireT1Admin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    // CSRF check
    const csrf = validateCsrf(req);
    if (!csrf.valid) return errorResponse(csrf.reason ?? "Requisição rejeitada", 400);

    // Rate limit
    const ip = getClientIp(req);
    const { success: allowed } = await adminRatelimit.limit(`admin:${ip}`);
    if (!allowed) return errorResponse("Muitas requisições. Tente novamente.", 429);

    const validated = ProductSchema.safeParse(body);

    if (!validated.success) {
      return formatZodError(validated.error);
    }

    const { simulatorUrl, subcategoryId, artId, ...data } = validated.data;

    if (artId) {
      const art = await prisma.artFile.findUnique({
        where: { id: artId },
        select: { id: true },
      });
      if (!art) {
        return errorResponse("Arte não encontrada", 400);
      }
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        simulatorUrl: simulatorUrl || null,
        subcategoryId: subcategoryId || null,
        artId: artId || null,
      },
    });

    revalidateCatalog();

    return Response.json(product, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { message: "Já existe um produto com este slug." },
        { status: 409 }
      );
    }
    console.error("[POST /api/admin/products]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
