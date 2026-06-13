import Image from "next/image";
import Link from "next/link";
import { Shirt } from "lucide-react";

interface ProductCardProps {
  slug: string;
  name: string;
  categorySlug: string;
  fabric?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
}

export function ProductCard({
  slug,
  name,
  categorySlug,
  fabric,
  imageUrl,
  imageAlt,
}: ProductCardProps) {
  return (
    <Link
      href={`/${categorySlug}/${slug}`}
      data-testid="product-card"
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-colors hover:border-primary focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt ?? name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Shirt className="size-10" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-4">
        <h3 className="font-medium text-card-foreground">{name}</h3>
        {fabric ? (
          <p className="text-sm text-muted-foreground">{fabric}</p>
        ) : null}
      </div>
    </Link>
  );
}
