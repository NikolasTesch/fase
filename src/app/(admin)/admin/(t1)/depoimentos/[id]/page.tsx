export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { TestimonialForm } from "../_components/TestimonialForm";

export const metadata: Metadata = { title: "Editar Depoimento — Admin" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDepoimentoPage({ params }: PageProps) {
  const { id } = await params;

  const testimonial = await prisma.testimonial.findUnique({ where: { id } });
  if (!testimonial) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Editar Depoimento</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {testimonial.clientName}
        </p>
      </div>
      <TestimonialForm
        testimonial={{
          ...testimonial,
          teamName: testimonial.teamName ?? "",
          sport: testimonial.sport ?? "",
          photoUrl: testimonial.photoUrl ?? "",
          logoUrl: testimonial.logoUrl ?? "",
          materialImageUrl: testimonial.materialImageUrl ?? "",
        }}
      />
    </div>
  );
}
