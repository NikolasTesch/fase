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
  camisa: "/images/size-guides/tabela-camisa.webp",
  "short-masc": "/images/size-guides/tabela-short-masc.webp",
  "short-fem": "/images/size-guides/tabela-short-fem.webp",
  "short-suplex": "/images/size-guides/tabela-short-suplex.webp",
  regata: "/images/size-guides/tabela-regata.webp",
  bermuda: "/images/size-guides/tabela-bermuda.webp",
};

interface SizeChartRow {
  label: string;
  values: string[];
}

interface SizeGuideModalProps {
  label: string;
  imageKey: string;
  chartData?: { columns: string[]; rows: SizeChartRow[] } | null;
}

export function SizeGuideModal({ label, imageKey, chartData }: SizeGuideModalProps) {
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
        {chartData && chartData.rows.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="border border-border bg-muted/50 px-3 py-2 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    Tamanho
                  </th>
                  {chartData.columns.map((col: string) => (
                    <th
                      key={col}
                      className="border border-border bg-muted/50 px-3 py-2 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chartData.rows.map((row: SizeChartRow) => (
                  <tr key={row.label} className="even:bg-muted/20">
                    <td className="border border-border px-3 py-2 font-medium">
                      {row.label}
                    </td>
                    {row.values.map((val: string, i: number) => (
                      <td
                        key={i}
                        className="border border-border px-3 py-2 text-center"
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="relative mt-4 aspect-[3/2] w-full overflow-hidden rounded-lg bg-muted">
            <Image
              src={src}
              alt={label}
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              className="object-contain"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
