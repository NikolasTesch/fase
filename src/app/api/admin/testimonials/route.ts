import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const TestimonialSchema = z.object({
  clientName: z.string().min(1).max(100),
  teamName: z.string().optional(),
  sport: z.string().optional(),
  text: z.string().min(1).max(2000),
  photoUrl: z.url().optional().or(z.literal("")),
  logoUrl: z.url().optional().or(z.literal("")),
  materialImageUrl: z.url().optional().or(z.literal("")),
  rating: z.number().int().min(1).max(5).default(5),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return Response.json(testimonials);
  } catch (error) {
    console.error("[GET /api/admin/testimonials]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = TestimonialSchema.safeParse(body);

    if (!validated.success) {
      return Response.json(
        { message: "Dados inválidos", errors: validated.error.issues },
        { status: 400 }
      );
    }

    const { photoUrl, logoUrl, materialImageUrl, ...data } = validated.data;

    const testimonial = await prisma.testimonial.create({
      data: {
        ...data,
        photoUrl: photoUrl || null,
        logoUrl: logoUrl || null,
        materialImageUrl: materialImageUrl || null,
      },
    });

    return Response.json(testimonial, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/testimonials]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
