"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AddCategoryButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlug(slugify(value));
    setSlugEdited(true);
  }

  function reset() {
    setName("");
    setSlug("");
    setSlugEdited(false);
    setError(null);
    setSaving(false);
  }

  async function submit() {
    if (!name.trim() || !slug.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? "Erro ao criar categoria");
        return;
      }

      reset();
      setOpen(false);
      router.refresh();
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        <Plus className="size-4" />
        Nova Categoria
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-sm font-medium text-foreground">Nova categoria</p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs text-muted-foreground">Nome *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Ex: Futebol"
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={saving}
            autoFocus
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs text-muted-foreground">Slug *</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="Ex: futebol"
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={saving}
          />
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={saving || !name.trim() || !slug.trim()}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50"
        >
          {saving && <Loader2 className="size-3.5 animate-spin" />}
          Criar
        </button>
        <button
          type="button"
          onClick={() => { reset(); setOpen(false); }}
          disabled={saving}
          className="rounded-md border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
