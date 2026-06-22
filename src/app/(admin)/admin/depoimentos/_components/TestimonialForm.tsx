"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";

interface Testimonial {
  id?: string;
  clientName: string;
  teamName: string;
  sport: string;
  text: string;
  photoUrl: string;
  logoUrl: string;
  materialImageUrl: string;
  rating: number;
  sortOrder: number;
  isActive: boolean;
}

interface TestimonialFormProps {
  testimonial?: Testimonial;
}

type ImageField = "photoUrl" | "logoUrl" | "materialImageUrl";

const imageFields: { key: ImageField; label: string }[] = [
  { key: "photoUrl", label: "Foto do cliente" },
  { key: "logoUrl", label: "Logo do time" },
  { key: "materialImageUrl", label: "Imagem do material" },
];

export function TestimonialForm({ testimonial }: TestimonialFormProps) {
  const router = useRouter();
  const isEditing = !!testimonial;
  const fileRefs = {
    photoUrl: useRef<HTMLInputElement>(null),
    logoUrl: useRef<HTMLInputElement>(null),
    materialImageUrl: useRef<HTMLInputElement>(null),
  };

  const [form, setForm] = useState({
    clientName: testimonial?.clientName ?? "",
    teamName: testimonial?.teamName ?? "",
    sport: testimonial?.sport ?? "",
    text: testimonial?.text ?? "",
    photoUrl: testimonial?.photoUrl ?? "",
    logoUrl: testimonial?.logoUrl ?? "",
    materialImageUrl: testimonial?.materialImageUrl ?? "",
    rating: testimonial?.rating ?? 5,
    sortOrder: testimonial?.sortOrder ?? 0,
    isActive: testimonial?.isActive ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<ImageField | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImageUpload(field: ImageField, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(field);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setForm((f) => ({ ...f, [field]: data.url }));
      }
    } finally {
      setUploading(null);
      if (fileRefs[field].current) fileRefs[field].current.value = "";
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const url = isEditing
      ? `/api/admin/testimonials/${testimonial!.id}`
      : "/api/admin/testimonials";

    const res = await fetch(url, {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        teamName: form.teamName || undefined,
        sport: form.sport || undefined,
        photoUrl: form.photoUrl || undefined,
        logoUrl: form.logoUrl || undefined,
        materialImageUrl: form.materialImageUrl || undefined,
        sortOrder: Number(form.sortOrder),
        rating: Number(form.rating),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Erro ao salvar");
      setSaving(false);
      return;
    }

    router.push("/admin/depoimentos");
  }

  const fieldClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  function ImageUploader({ field, label }: { field: ImageField; label: string }) {
    const isUploading = uploading === field;
    const url = form[field];

    return (
      <div>
        <label className="block text-sm font-medium mb-1">{label}</label>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="url"
              value={url}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              placeholder="URL da imagem"
              className={fieldClass}
            />
            <label className="mt-1.5 inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors">
              {isUploading ? (
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
                ref={fileRefs[field]}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleImageUpload(field, e)}
                disabled={isUploading}
              />
            </label>
          </div>
          {url && (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
              <Image src={url} alt={label} fill className="object-cover" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome do cliente *</label>
          <input
            value={form.clientName}
            onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time</label>
          <input
            value={form.teamName}
            onChange={(e) => setForm({ ...form, teamName: e.target.value })}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Esporte</label>
          <input
            value={form.sport}
            onChange={(e) => setForm({ ...form, sport: e.target.value })}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ordem</label>
          <input
            type="number"
            min={0}
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Depoimento *</label>
        <textarea
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
          rows={4}
          className={`${fieldClass} resize-none`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nota</label>
          <select
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            className={fieldClass}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded"
            />
            Ativo
          </label>
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Imagens
        </h3>
        {imageFields.map(({ key, label }) => (
          <ImageUploader key={key} field={key} label={label} />
        ))}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving || !form.clientName || !form.text}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
        <button
          onClick={() => router.back()}
          className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
