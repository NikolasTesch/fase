import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { TestimonialToggle } from "./_components/TestimonialToggle";

export const metadata: Metadata = { title: "Depoimentos — Admin" };

export default async function DepoimentosPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Depoimentos</h1>
        <Link
          href="/admin/depoimentos/novo"
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/80 transition-colors"
        >
          Novo depoimento
        </Link>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Cliente</th>
              <th className="text-left px-4 py-3 font-medium">Time</th>
              <th className="text-left px-4 py-3 font-medium">Nota</th>
              <th className="text-left px-4 py-3 font-medium">Ordem</th>
              <th className="text-left px-4 py-3 font-medium">Ativo</th>
              <th className="text-left px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{t.clientName}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.teamName ?? "—"}</td>
                <td className="px-4 py-3">{t.rating}/5</td>
                <td className="px-4 py-3">{t.sortOrder}</td>
                <td className="px-4 py-3">
                  <TestimonialToggle id={t.id} isActive={t.isActive} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/depoimentos/${t.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {testimonials.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum depoimento cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
