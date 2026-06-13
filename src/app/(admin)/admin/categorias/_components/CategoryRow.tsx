"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CategoryRowProps {
  category: {
    id: string;
    name: string;
    slug: string;
    sortOrder: number;
    isActive: boolean;
    _count: { products: number };
  };
  index: number;
}

export function CategoryRow({ category, index }: CategoryRowProps) {
  const [sortOrder, setSortOrder] = useState(category.sortOrder);
  const [isActive, setIsActive] = useState(category.isActive);
  const [saving, setSaving] = useState(false);

  async function save(patch: object) {
    setSaving(true);
    await fetch(`/api/admin/categories/${category.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSaving(false);
  }

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25, ease: "easeOut" }}
      className="border-t border-border hover:bg-muted/30 transition-colors duration-150"
    >
      <td className="px-4 py-3.5 font-medium">{category.name}</td>
      <td className="px-4 py-3.5 text-muted-foreground font-mono text-xs">
        {category.slug}
      </td>
      <td className="px-4 py-3.5">
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
          {category._count.products} produto{category._count.products !== 1 ? "s" : ""}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          onBlur={() => save({ sortOrder })}
          disabled={saving}
          className="w-16 rounded-lg border border-border px-2 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
        />
      </td>
      <td className="px-4 py-3.5">
        <button
          onClick={() => {
            const next = !isActive;
            setIsActive(next);
            save({ isActive: next });
          }}
          disabled={saving}
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
            isActive
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          {isActive ? "Ativo" : "Inativo"}
        </button>
      </td>
    </motion.tr>
  );
}
