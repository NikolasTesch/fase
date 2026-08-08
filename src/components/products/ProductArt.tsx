import Image from "next/image";
import { FileDown } from "lucide-react";

interface ProductArtProps {
  art: {
    id: string;
    name: string;
    previewUrl: string;
    previewMimeType: string;
    originalFileName: string;
  };
}

export function ProductArt({ art }: ProductArtProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm">
      <div className="flex flex-col gap-1 px-5 pt-4">
        <h2 className="font-heading text-sm font-semibold text-foreground">
          Arte do produto
        </h2>
        <p className="text-xs text-muted-foreground">
          Arquivo vetorial enviado para produção
        </p>
      </div>

      <div className="p-5">
        <div className="bg-muted/40 p-6">
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={art.previewUrl}
              alt={art.name}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              loading="lazy"
              className="object-contain"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border/60 px-5 py-3">
        <FileDown className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden="true" />
        <span
          className="min-w-0 flex-1 truncate text-xs text-muted-foreground"
          title={art.originalFileName}
        >
          {art.originalFileName}
        </span>
      </div>
    </section>
  );
}
