"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

type Product = {
  id: string;
  name: string;
  isActive: boolean;
  isFeatured: boolean;
  category: { name: string };
  images: { url: string; altText: string | null }[];
};

export function AnimatedTableRows({ products }: { products: Product[] }) {
  return (
    <tbody>
      {products.map((p, i) => (
        <motion.tr
          key={p.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.25, ease: "easeOut" }}
          className="border-t border-border hover:bg-muted/30 transition-colors duration-150"
        >
          {/* Thumbnail */}
          <td className="px-4 py-3">
            {p.images[0] ? (
              <div className="w-9 h-9 rounded-lg overflow-hidden border border-border bg-muted shrink-0">
                <Image
                  src={p.images[0].url}
                  alt={p.images[0].altText ?? p.name}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center">
                <span className="text-muted-foreground/40 text-xs font-bold">
                  {p.name[0]}
                </span>
              </div>
            )}
          </td>

          <td className="px-4 py-3 font-medium">{p.name}</td>

          <td className="px-4 py-3 text-muted-foreground">{p.category.name}</td>

          <td className="px-4 py-3">
            {p.isFeatured ? (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300">
                <Star size={11} className="fill-current" />
                Destaque
              </span>
            ) : (
              <span className="text-muted-foreground/50 text-xs">—</span>
            )}
          </td>

          <td className="px-4 py-3">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                p.isActive
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {p.isActive ? "Ativo" : "Inativo"}
            </span>
          </td>

          <td className="px-4 py-3">
            <Link
              href={`/admin/produtos/${p.id}`}
              className="text-xs text-primary hover:underline underline-offset-2"
            >
              Editar
            </Link>
          </td>
        </motion.tr>
      ))}
    </tbody>
  );
}
