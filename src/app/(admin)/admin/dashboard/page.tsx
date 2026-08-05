export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ArrowRight, Plus, Users, HelpCircle, Tag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardCards } from "./_components/DashboardCards";
import { LeadMetrics } from "./_components/LeadMetrics";

export const metadata: Metadata = { title: "Dashboard — Admin Fase Sport" };

export default async function DashboardPage() {
  const [totalProducts, newLeads, activeTestimonials, activeFaqs, totalCategories] =
    await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.testimonial.count({ where: { isActive: true } }),
      prisma.faq.count({ where: { isActive: true } }),
      prisma.category.count(),
    ]);

  const shortcuts = [
    { href: "/admin/produtos/novo", label: "Novo produto", icon: Plus, desc: "Adicionar item ao catálogo" },
    { href: "/admin/leads", label: "Gerenciar leads", icon: Users, desc: "Ver solicitações pendentes" },
    { href: "/admin/faqs", label: "Gerenciar FAQs", icon: HelpCircle, desc: "Editar perguntas frequentes" },
    { href: "/admin/categorias", label: "Categorias", icon: Tag, desc: "Organizar modalidades" },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl border border-border/80 bg-gradient-to-r from-card via-card to-primary/5 p-6 sm:p-8 overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles size={13} />
              <span>Painel de Controle</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Visão Geral do Sistema
            </h1>
            <p className="text-muted-foreground text-sm mt-1 max-w-xl">
              Gerencie produtos, atenda orçamentos de novos clientes e acompanhe as métricas da loja Fase Sport.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button variant="default" render={<Link href="/admin/produtos/novo" />} className="gap-2 shadow-md shadow-primary/20">
              <Plus size={16} />
              Novo Produto
            </Button>
          </div>
        </div>
      </div>

      {/* Cards de métricas */}
      <DashboardCards
        counts={{
          products: totalProducts,
          leads: newLeads,
          testimonials: activeTestimonials,
          faqs: activeFaqs,
          categories: totalCategories,
        }}
      />

      {/* Lead metrics & charts */}
      <LeadMetrics />

      {/* Atalhos rápidos */}
      <div>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
          Ações Rápidas & Atalhos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {shortcuts.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 hover:border-primary/40 hover:bg-card hover:shadow-lg transition-all duration-200"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-200 mb-3">
                  <Icon size={18} />
                </div>
                <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors duration-200">
                  {label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {desc}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mt-4 pt-3 border-t border-border/40 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">
                <span>Acessar</span>
                <ArrowRight size={13} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
