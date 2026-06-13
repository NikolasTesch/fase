"use client";

import { useState } from "react";

interface CategoryRowProps {
  category: {
    id: string;
    name: string;
    slug: string;
    sortOrder: number;
    isActive: boolean;
    _count: { products: number };
  };
}

export function CategoryRow({ category }: CategoryRowProps) {
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
    <tr className="border-t border-border">
      <td className="px-4 py-3 font-medium">{category.name}</td>
      <td className="px-4 py-3 text-muted-foreground">{category.slug}</td>
      <td className="px-4 py-3">{category._count.products}</td>
      <td className="px-4 py-3">
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          onBlur={() => save({ sortOrder })}
          disabled={saving}
          className="w-16 rounded border border-border px-2 py-1 text-sm bg-background"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => {
            setIsActive(e.target.checked);
            save({ isActive: e.target.checked });
          }}
          disabled={saving}
          className="rounded"
        />
      </td>
    </tr>
  );
}
