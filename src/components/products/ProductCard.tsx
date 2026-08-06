"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Shirt } from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";

interface ProductCardProps {
  slug: string;
  name: string;
  categorySlug: string;
  categoryName?: string | null;
  minQty?: number | null;
  fabric?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
}

export function ProductCard({
  slug,
  name,
  categorySlug,
  categoryName,
  minQty,
  fabric,
  imageUrl,
  imageAlt,
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={`/${categorySlug}/${slug}`} data-testid="product-card" className="group block">
      <GlassCard className="flex flex-col overflow-hidden group-hover:border-accent/40 group-hover:shadow-xl group-hover:shadow-accent/5">
        <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-muted to-muted/40">
          {imageUrl && !imgError ? (
            <>
              <Image
                src={imageUrl}
                alt={imageAlt ?? name}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                onError={() => setImgError(true)}
              />
              {/* Overlay no hover com CTA */}
              <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/70 via-black/20 to-transparent p-5 opacity-0 transition-all duration-300 group-hover:opacity-100">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-accent-foreground shadow-xl transition-transform duration-300 group-hover:translate-y-0 translate-y-2">
                  Ver Detalhes
                  <ArrowRight className="size-3.5" />
                </span>
              </div>
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/5 to-brand-dark/10 text-muted-foreground">
              <Shirt className="size-12 text-muted-foreground/30 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
              <span className="text-xs font-medium text-muted-foreground/50">Sem imagem</span>
            </div>
          )}
          {/* Badge de tecido */}
          {fabric ? (
            <span className="absolute left-3 top-3 rounded-full border border-accent/30 bg-card/80 px-3 py-1 text-[11px] font-semibold text-accent backdrop-blur-md shadow-sm">
              {fabric}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 p-5">
          <h3 className="font-heading text-lg font-bold text-card-foreground transition-colors duration-200 group-hover:text-accent">
            {name}
          </h3>
          {(categoryName || minQty != null) ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {categoryName ? (
                <span className="rounded-md bg-muted/80 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {categoryName}
                </span>
              ) : null}
              {minQty != null ? (
                <span className="rounded-md bg-accent/10 border border-accent/20 px-2.5 py-1 text-xs font-semibold text-accent">
                  Mín. {minQty} peças
                </span>
              ) : null}
            </div>
          ) : null}
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70 pt-1">Sob consulta</p>
        </div>
      </GlassCard>
    </Link>
  );
}
