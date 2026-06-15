"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

interface Post {
  id: string;
  imageUrl: string;
  linkUrl: string;
  caption: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface InstagramPostRowProps {
  post: Post;
}

export function InstagramPostRow({ post }: InstagramPostRowProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    imageUrl: post.imageUrl,
    linkUrl: post.linkUrl,
    caption: post.caption ?? "",
    sortOrder: post.sortOrder,
    isActive: post.isActive,
  });
  const [saving, setSaving] = useState(false);

  const update = async () => {
    setSaving(true);
    try {
      await fetch(`/api/admin/instagram/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          caption: form.caption || undefined,
        }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm("Remover este post?")) return;
    await fetch(`/api/admin/instagram/${post.id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-start">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
        <Image src={form.imageUrl} alt="Post" fill className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <input
          type="url"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          placeholder="URL da imagem"
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          type="url"
          value={form.linkUrl}
          onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
          placeholder="URL de destino (Instagram)"
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          type="text"
          value={form.caption}
          onChange={(e) => setForm({ ...form, caption: e.target.value })}
          placeholder="Legenda (opcional)"
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              className="w-16 rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            Ordem
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded"
            />
            Ativo
          </label>
          <button
            type="button"
            onClick={update}
            disabled={saving}
            className="ml-auto flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
          >
            <Save className="size-3.5" />
            Salvar
          </button>
          <button
            type="button"
            onClick={remove}
            className="flex items-center gap-1.5 rounded-md border border-destructive/50 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
