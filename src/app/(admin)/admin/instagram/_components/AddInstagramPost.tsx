"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Plus, Upload, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function AddInstagramPost() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ imageUrl: "", linkUrl: "", caption: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const submit = async () => {
    if (!form.imageUrl || !form.linkUrl) return;
    setSaving(true);
    try {
      await fetch("/api/admin/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: form.imageUrl,
          linkUrl: form.linkUrl,
          caption: form.caption || undefined,
        }),
      });
      setForm({ imageUrl: "", linkUrl: "", caption: "" });
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setForm((f) => ({ ...f, imageUrl: data.url }));
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        <Plus className="size-4" />
        Adicionar Post
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      {/* Upload / URL da imagem */}
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="URL da imagem *"
            className="mb-2 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors">
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="size-4" />
                Fazer upload
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>
        {form.imageUrl && (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
            <Image src={form.imageUrl} alt="Preview" fill className="object-cover" />
          </div>
        )}
      </div>

      <input
        type="url"
        value={form.linkUrl}
        onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
        placeholder="URL de destino (Instagram) *"
        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <input
        type="text"
        value={form.caption}
        onChange={(e) => setForm({ ...form, caption: e.target.value })}
        placeholder="Legenda (opcional)"
        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={saving || !form.imageUrl || !form.linkUrl}
          className="rounded-md bg-primary px-4 py-1.5 text-sm text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-border px-4 py-1.5 text-sm text-muted-foreground hover:bg-muted"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
