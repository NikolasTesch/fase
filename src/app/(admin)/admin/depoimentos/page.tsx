export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { TestimonialToggle } from "./_components/TestimonialToggle";
import { Plus, MessageSquare, Star } from "lucide-react";
import { AnimatedTestimonialRows } from "./_components/AnimatedTestimonialRows";

export const metadata: Metadata = { title: "Depoimentos — Admin" };

export default async function DepoimentosPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Depoimentos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {testimonials.length} depoimento{testimonials.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button render={<Link href="#" />} className="gap-2">
          <Plus size={16} />
          Novo depoimento
        </Button>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Cliente
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Time
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Nota
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Ordem
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Ativo
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider" />
            </tr>
          </thead>
          <AnimatedTestimonialRows testimonials={testimonials} />
        </table>

        {testimonials.length === 0 && (
          <div className="px-4 py-16 text-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <MessageSquare size={32} className="opacity-30" />
              <p className="text-sm">Nenhum depoimento cadastrado.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
