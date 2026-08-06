import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Shirt } from "lucide-react";

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
  return (
    <Link
      href={`/${categorySlug}/${slug}`}
      data-testid="product-card"
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card text-card-foreground shadow-sm ring-1 ring-black/[0.03] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-accent/30 focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/50 focus-visible:outline-none"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-muted to-muted/50">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={imageAlt ?? name}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Overlay no hover com CTA */}
            <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 via-black/10 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-xl">
                Ver Detalhes
                <ArrowRight className="size-3.5" />
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/5 to-brand-dark/10 text-muted-foreground">
            <Shirt className="size-12 text-muted-foreground/40" aria-hidden="true" />
            <span className="text-xs font-medium text-muted-foreground/60">Sem imagem</span>
          </div>
        )}
        {/* Badge de tecido */}
        {fabric ? (
          <span className="absolute left-2 top-2 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent backdrop-blur-sm">
            {fabric}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-1 p-4">
        <h3 className="font-medium text-card-foreground group-hover:text-accent transition-colors duration-200">{name}</h3>
        {(categoryName || minQty != null) ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {categoryName ? (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {categoryName}
              </span>
            ) : null}
            {minQty != null ? (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Mín. {minQty} peças
              </span>
            ) : null}
          </div>
        ) : null}
        <p className="text-sm italic text-muted-foreground/70">Sob consulta</p>
      </div>
    </Link>
  );
}
