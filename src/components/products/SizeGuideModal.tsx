"use client";

import Image from "next/image";
import { Ruler } from "lucide-react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const SIZE_GUIDE_IMAGES: Record<string, string> = {
  camisa: "/images/size-guides/tabela-camisa.png",
  "short-masc": "/images/size-guides/tabela-short-masc.png",
  "short-fem": "/images/size-guides/tabela-short-fem.png",
  "short-suplex": "/images/size-guides/tabela-short-suplex.png",
  regata: "/images/size-guides/tabela-regata.png",
  bermuda: "/images/size-guides/tabela-bermuda.png",
};

interface SizeGuideModalProps {
  label: string;
  imageKey: string;
}

export function SizeGuideModal({ label, imageKey }: SizeGuideModalProps) {
  const src =
    SIZE_GUIDE_IMAGES[imageKey] ??
    `${process.env.NEXT_PUBLIC_R2_URL ?? ""}/size-guides/tabela-${imageKey}.png`;

  return (
    <Dialog>
      <DialogTrigger className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
        <Ruler className="size-3" />
        {label}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{label}</DialogTitle>
        <div className="relative mt-4 aspect-[3/2] w-full overflow-hidden rounded-lg bg-muted">
          <Image
            src={src}
            alt={label}
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
