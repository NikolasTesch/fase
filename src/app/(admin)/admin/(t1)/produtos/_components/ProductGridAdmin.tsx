"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

type Product = {
  id: string;
  name: string;
  fabric: string | null;
  minQty: number;
  isActive: boolean;
  isFeatured: boolean;
  category: { name: string };
  images: { url: string; altText: string | null }[];
};

export function ProductGridAdmin({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.25, ease: "easeOut" }}
          className="group flex flex-col rounded-2xl border border-border/80 bg-card overflow-hidden hover:shadow-md hover:shadow-black/5 transition-shadow duration-150"
        >
          {/* Imagem */}
          <div className="aspect-square w-full overflow-hidden bg-muted">
            {p.images[0] ? (
              <Image
                src={p.images[0].url}
                alt={p.images[0].altText ?? p.name}
                width={400}
                height={400}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-5xl font-extrabold text-muted-foreground/30">
                  {p.name[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Conteúdo */}
          <div className="flex flex-col gap-3 p-4">
            <h3 className="font-bold text-sm leading-snug line-clamp-2">{p.name}</h3>

            <div className="flex flex-wrap gap-1.5">
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

              {p.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  <Star size={11} className="fill-current" />
                  Destaque
                </span>
              )}

              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {p.category.name}
              </span>

              {p.fabric && (
                <span className="rounded-full border border-accent px-2.5 py-0.5 text-xs font-medium text-accent">
                  {p.fabric}
                </span>
              )}

              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Mín. {p.minQty}
              </span>
            </div>

            <Link
              href={`/admin/produtos/${p.id}`}
              className="mt-auto text-xs font-semibold text-primary hover:underline underline-offset-2"
            >
              Editar
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
