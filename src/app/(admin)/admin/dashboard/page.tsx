export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  Package,
  Users,
  MessageSquare,
  HelpCircle,
  Tag,
  ArrowRight,
  Plus,
} from "lucide-react";
import { DashboardCards } from "./_components/DashboardCards";
import { LeadMetrics } from "./_components/LeadMetrics";

export const metadata: Metadata = { title: "Dashboard — Admin" };

export default async function DashboardPage() {
  const [totalProducts, newLeads, activeTestimonials, activeFaqs, totalCategories] =
    await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.testimonial.count({ where: { isActive: true } }),
      prisma.faq.count({ where: { isActive: true } }),
      prisma.category.count(),
    ]);

  const cards = [
    {
      label: "Produtos ativos",
      value: totalProducts,
      href: "/admin/produtos",
      icon: Package,
      color: "blue" as const,
      description: "uniformes no catálogo",
    },
    {
      label: "Leads novos",
      value: newLeads,
      href: "/admin/leads",
      icon: Users,
      color: "amber" as const,
      description: "aguardando contato",
    },
    {
      label: "Depoimentos ativos",
      value: activeTestimonials,
      href: "/admin/depoimentos",
      icon: MessageSquare,
      color: "green" as const,
      description: "exibidos no site",
    },
    {
      label: "FAQs ativas",
      value: activeFaqs,
      href: "/admin/faqs",
      icon: HelpCircle,
      color: "purple" as const,
      description: "perguntas publicadas",
    },
    {
      label: "Categorias",
      value: totalCategories,
      href: "/admin/categorias",
      icon: Tag,
      color: "brand" as const,
      description: "esportes disponíveis",
    },
  ];

  const shortcuts = [
    { href: "/admin/produtos/novo", label: "Novo produto", icon: Plus },
    { href: "/admin/leads", label: "Ver leads", icon: Users },
    { href: "/admin/faqs", label: "Gerenciar FAQs", icon: HelpCircle },
    { href: "/admin/categorias", label: "Categorias", icon: Tag },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visão geral do painel administrativo Fase Sport
        </p>
      </div>

      {/* Cards de métricas */}
      <DashboardCards cards={cards} />

      <LeadMetrics />

      {/* Atalhos rápidos */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Ações rápidas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {shortcuts.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium hover:border-primary/40 hover:bg-primary/4 transition-all duration-200"
            >
              <Icon
                size={16}
                className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors duration-200"
              />
              <span className="flex-1">{label}</span>
              <ArrowRight
                size={14}
                className="shrink-0 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
