"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Download, FileDown } from "lucide-react";

type ArtesGridProps = {
  artes: {
    id: string;
    name: string;
    category: { name: string };
    art: {
      id: string;
      name: string;
      previewUrl: string;
      previewMimeType: string;
      originalFileName: string;
      originalMimeType: string;
      sizeBytes: number | null;
    };
  }[];
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ArtesGrid({ artes }: ArtesGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {artes.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.25, ease: "easeOut" }}
          className="group flex flex-col rounded-2xl border border-border/80 bg-card overflow-hidden hover:shadow-md hover:shadow-black/5 transition-shadow duration-150"
        >
          {/* Preview da arte */}
          <div className="aspect-square w-full overflow-hidden bg-muted">
            <Image
              src={p.art.previewUrl}
              alt={p.art.name}
              width={400}
              height={400}
              className="object-contain p-6"
            />
          </div>

          {/* Conteúdo */}
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-sm leading-snug line-clamp-2">{p.name}</h3>
              <span className="shrink-0 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-medium">
                Tem arte
              </span>
            </div>

            <span className="self-start rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {p.category.name}
            </span>

            <div className="flex items-center gap-1.5 min-w-0">
              <FileDown size={12} className="shrink-0 text-muted-foreground/60" aria-hidden="true" />
              <span
                className="min-w-0 flex-1 truncate text-xs text-muted-foreground"
                title={p.art.originalFileName}
              >
                {p.art.originalFileName}
              </span>
              {p.art.sizeBytes != null && (
                <span className="shrink-0 text-xs text-muted-foreground/70">
                  {formatBytes(p.art.sizeBytes)}
                </span>
              )}
            </div>

            <a
              href={`/api/admin/products/art/${p.art.id}/download`}
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1.5 w-full mt-auto")}
            >
              <Download size={14} />
              Baixar original
            </a>

            <Link
              href={`/admin/produtos/${p.id}`}
              className="text-center text-xs font-semibold text-primary hover:underline underline-offset-2"
            >
              Editar produto
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
