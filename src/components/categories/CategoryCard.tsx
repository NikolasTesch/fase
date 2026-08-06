"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Shirt } from "lucide-react";

interface CategoryCardProps {
  slug: string;
  name: string;
  imageUrl?: string | null;
}

export function CategoryCard({ slug, name, imageUrl }: CategoryCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/${slug}`}
      data-testid={`category-card-${slug}`}
      className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {imageUrl && !imgError ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
          <Shirt className="size-10 text-muted-foreground/40" aria-hidden="true" />
        </div>
      )}
      <div className="relative bg-gradient-to-t from-primary/90 to-primary/0 p-4 pt-10">
        <h3 className="font-heading text-xl text-primary-foreground">{name}</h3>
      </div>
    </Link>
  );
}
