"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function AdminSidebarClient({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();

  return (
    <ul className="space-y-0.5">
      {nav.map(({ href, label, icon: Icon }, i) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");

        return (
          <motion.li
            key={href}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25, ease: "easeOut" }}
          >
            <Link
              href={href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "text-primary bg-primary/8"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="admin-nav-active"
                  className="absolute inset-0 rounded-lg bg-primary/8 border border-primary/20"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <Icon
                size={16}
                className={cn(
                  "shrink-0 relative z-10 transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span className="relative z-10">{label}</span>
              {isActive && (
                <span className="ml-auto relative z-10 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          </motion.li>
        );
      })}
    </ul>
  );
}
