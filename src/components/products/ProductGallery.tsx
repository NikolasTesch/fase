"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, type PanInfo } from "framer-motion";
import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface GalleryImage {
  url: string;
  altText: string | null;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  productName: string;
}

const SWIPE_THRESHOLD = 50;

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const x = useMotionValue(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground">
        <ImageIcon className="size-12" aria-hidden="true" />
      </div>
    );
  }

  const activeImage = images[activeIndex];

  function goTo(index: number) {
    if (index < 0 || index > images.length - 1) {
      return;
    }
    setActiveIndex(index);
  }

  function handleDragEnd(_event: unknown, info: PanInfo) {
    if (info.offset.x <= -SWIPE_THRESHOLD) {
      goTo(activeIndex + 1);
    } else if (info.offset.x >= SWIPE_THRESHOLD) {
      goTo(activeIndex - 1);
    }
    x.set(0);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-muted">
        <motion.div
          className="relative h-full w-full"
          style={prefersReducedMotion ? undefined : { x }}
          drag={prefersReducedMotion ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={prefersReducedMotion ? undefined : handleDragEnd}
        >
          <Image
            src={activeImage.url}
            alt={activeImage.altText ?? productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            draggable={false}
            className="object-cover"
          />
        </motion.div>
      </div>

      {images.length > 1 ? (
        <div
          className="flex gap-3 overflow-x-auto pb-1"
          role="tablist"
          aria-label={`Imagens de ${productName}`}
        >
          {images.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`${image.url}-${index}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Ver imagem ${index + 1} de ${productName}`}
                onClick={() => goTo(index)}
                  className={cn(
                    "relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-muted transition-all duration-200 focus-visible:ring-3 focus-visible:ring-accent/50 focus-visible:outline-none",
                    isActive
                      ? "border-accent shadow-sm"
                      : "border-border/60 hover:border-accent/40 hover:shadow-sm"
                  )}
              >
                <Image
                  src={image.url}
                  alt={image.altText ?? `${productName} ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
