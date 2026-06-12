import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Dashboard — Admin" };

export default async function DashboardPage() {
  const [totalProducts, newLeads, activeTestimonials] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.testimonial.count({ where: { isActive: true } }),
  ]);

  const cards = [
    { label: "Produtos ativos", value: totalProducts, href: "/admin/produtos" },
    { label: "Leads novos", value: newLeads, href: "/admin/leads" },
    { label: "Depoimentos ativos", value: activeTestimonials, href: "/admin/depoimentos" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {cards.map(({ label, value, href }) => (
          <Link
            key={href}
            href={href}
            className="block rounded-xl border border-border bg-card p-6 hover:bg-muted/50 transition-colors"
          >
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{label}</p>
          </Link>
        ))}
      </div>

      <h2 className="text-base font-medium mb-4">Atalhos rápidos</h2>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/produtos/novo"
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
        >
          Novo produto
        </Link>
        <Link
          href="/admin/leads"
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
        >
          Ver leads
        </Link>
        <Link
          href="/admin/faqs"
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
        >
          Gerenciar FAQs
        </Link>
      </div>
    </div>
  );
}
