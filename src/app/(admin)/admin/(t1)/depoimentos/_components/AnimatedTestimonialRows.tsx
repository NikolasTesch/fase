"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { TestimonialToggle } from "./TestimonialToggle";

type Testimonial = {
  id: string;
  clientName: string;
  teamName: string | null;
  rating: number;
  sortOrder: number;
  isActive: boolean;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={cn(
            "transition-colors",
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground/20",
          )}
        />
      ))}
    </div>
  );
}

export function AnimatedTestimonialRows({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  return (
    <tbody>
      {testimonials.map((t, i) => (
        <motion.tr
          key={t.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.25, ease: "easeOut" }}
          className="border-t border-border hover:bg-muted/30 transition-colors duration-150"
        >
          <td className="px-4 py-3.5 font-medium">{t.clientName}</td>
          <td className="px-4 py-3.5 text-muted-foreground">{t.teamName ?? "—"}</td>
          <td className="px-4 py-3.5">
            <StarRating rating={t.rating} />
          </td>
          <td className="px-4 py-3.5 text-muted-foreground">{t.sortOrder}</td>
          <td className="px-4 py-3.5">
            <TestimonialToggle id={t.id} isActive={t.isActive} />
          </td>
          <td className="px-4 py-3.5">
            <Link
              href={`/admin/depoimentos/${t.id}`}
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <Pencil size={12} />
              Editar
            </Link>
          </td>
        </motion.tr>
      ))}
    </tbody>
  );
}
