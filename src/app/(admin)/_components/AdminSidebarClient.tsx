"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Tag,
  Users,
  MessageSquare,
  HelpCircle,
  Camera,
  Ruler,
  Shirt,
  Images,
  UserCog,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AdminRole = "T1_GERENCIA" | "T2_VENDEDOR";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/chat-analytics", label: "Analytics Chat RAG", icon: Bot },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: Tag },
  { href: "/admin/medidas", label: "Medidas", icon: Ruler },
  { href: "/admin/modalidades", label: "Modalidades", icon: Shirt },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/depoimentos", label: "Depoimentos", icon: MessageSquare },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/instagram", label: "Instagram", icon: Camera },
  { href: "/admin/conteudo", label: "Conteúdo", icon: Images },
  { href: "/admin/usuarios", label: "Usuários", icon: UserCog },
];

export function AdminSidebarClient({ role }: { role: AdminRole }) {
  const pathname = usePathname();

  const items =
    role === "T2_VENDEDOR"
      ? NAV.filter((item) => item.href === "/admin/conteudo")
      : NAV;

  return (
    <ul className="space-y-1">
      {items.map(({ href, label, icon: Icon }, i) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");

        return (
          <motion.li
            key={href}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, duration: 0.2, ease: "easeOut" }}
          >
            <Link
              href={href}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "text-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="admin-nav-active"
                  className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/25 shadow-sm"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <Icon
                size={17}
                className={cn(
                  "shrink-0 relative z-10 transition-colors duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              <span className="relative z-10">{label}</span>
              {isActive && (
                <span className="ml-auto relative z-10 w-1.5 h-1.5 rounded-full bg-primary shadow-sm shadow-primary" />
              )}
            </Link>
          </motion.li>
        );
      })}
    </ul>
  );
}
