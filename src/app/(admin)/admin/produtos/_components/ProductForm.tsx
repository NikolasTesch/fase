"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: { id: string; name: string; slug: string }[];
}

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  fabric: string | null;
  minQty: number;
  isFeatured: boolean;
  isActive: boolean;
  seoTitle: string | null;
  seoDesc: string | null;
  simulatorUrl: string | null;
  sortOrder: number;
  categoryId: string;
  subcategoryId: string | null;
  images: ProductImage[];
}

interface ProductFormProps {
  categories: Category[];
  product?: Product;
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;

  const [form, setForm] = useState({
    slug: product?.slug ?? "",
    name: product?.name ?? "",
    description: product?.description ?? "",
    fabric: product?.fabric ?? "",
    minQty: product?.minQty ?? 10,
    isFeatured: product?.isFeatured ?? false,
    isActive: product?.isActive ?? true,
    seoTitle: product?.seoTitle ?? "",
    seoDesc: product?.seoDesc ?? "",
    simulatorUrl: product?.simulatorUrl ?? "",
    sortOrder: product?.sortOrder ?? 0,
    categoryId: product?.categoryId ?? "",
    subcategoryId: product?.subcategoryId ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);

  const selectedCategory = categories.find((c) => c.id === form.categoryId);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const url = isEditing
      ? `/api/admin/products/${product!.id}`
      : "/api/admin/products";

    const res = await fetch(url, {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        simulatorUrl: form.simulatorUrl || null,
        subcategoryId: form.subcategoryId || null,
        minQty: Number(form.minQty),
        sortOrder: Number(form.sortOrder),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Erro ao salvar");
      setSaving(false);
      return;
    }

    if (!isEditing) {
      const created = await res.json();
      router.push(`/admin/produtos/${created.id}`);
    } else {
      router.refresh();
    }

    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Desativar este produto?")) return;
    await fetch(`/api/admin/products/${product!.id}`, { method: "DELETE" });
    router.push("/admin/produtos");
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length || !product?.id) return;

    setUploadingImage(true);
    const isPrimary = images.length === 0;

    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("productId", product.id);
      fd.append("isPrimary", String(isPrimary));

      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setImages((prev) => [
          ...prev,
          { id: data.imageId, url: data.url, altText: null, isPrimary, sortOrder: prev.length },
        ]);
      }
    }

    setUploadingImage(false);
    e.target.value = "";
  }

  async function handleRemoveImage(imageId: string) {
    await fetch(`/api/admin/products/${product!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    // Apenas remove da exibição — a imagem continua no banco até limpeza manual
    setImages((prev) => prev.filter((i) => i.id !== imageId));
  }

  const field = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="max-w-2xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome *</label>
          <input
            value={form.name}
            onChange={(e) => {
              set("name", e.target.value);
              if (!isEditing) {
                set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
              }
            }}
            className={field}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug *</label>
          <input
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            className={field}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descrição</label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          className={`${field} resize-none`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Categoria *</label>
          <select
            value={form.categoryId}
            onChange={(e) => { set("categoryId", e.target.value); set("subcategoryId", ""); }}
            className={field}
          >
            <option value="">Selecione...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sub-categoria</label>
          <select
            value={form.subcategoryId}
            onChange={(e) => set("subcategoryId", e.target.value)}
            disabled={!selectedCategory?.subcategories.length}
            className={field}
          >
            <option value="">Nenhuma</option>
            {selectedCategory?.subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tecido</label>
          <input value={form.fabric} onChange={(e) => set("fabric", e.target.value)} className={field} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Qtd. mínima</label>
          <input type="number" min={1} value={form.minQty} onChange={(e) => set("minQty", Number(e.target.value))} className={field} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ordem</label>
          <input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} className={field} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Link do Simulador</label>
        <input value={form.simulatorUrl} onChange={(e) => set("simulatorUrl", e.target.value)} className={field} placeholder="https://simulador.fasesport.com/..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">SEO Title</label>
          <input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className={field} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">SEO Description</label>
          <input value={form.seoDesc} onChange={(e) => set("seoDesc", e.target.value)} className={field} />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} />
          Destaque
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
          Ativo
        </label>
      </div>

      {/* Imagens — disponível apenas no modo edição */}
      {isEditing && (
        <div>
          <label className="block text-sm font-medium mb-2">Imagens</label>
          <div className="flex flex-wrap gap-3 mb-3">
            {images.map((img) => (
              <div key={img.id} className="relative w-24 h-24 rounded-md overflow-hidden border border-border">
                <Image
                  src={img.url}
                  alt={img.altText ?? ""}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
                {img.isPrimary && (
                  <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1 rounded">
                    Principal
                  </span>
                )}
                <button
                  onClick={() => handleRemoveImage(img.id)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 text-xs leading-none flex items-center justify-center"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <label className="cursor-pointer inline-flex items-center gap-2 text-sm rounded-md border border-border px-3 py-2 hover:bg-muted transition-colors">
            {uploadingImage ? "Enviando..." : "Adicionar imagens"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploadingImage}
            />
          </label>
          {!isEditing && (
            <p className="text-xs text-muted-foreground mt-1">Salve o produto primeiro para adicionar imagens.</p>
          )}
        </div>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex items-center justify-between pt-2">
        {isEditing && (
          <Button variant="destructive" onClick={handleDelete}>
            Desativar produto
          </Button>
        )}
        <div className="flex gap-3 ml-auto">
          <Button variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button disabled={saving} onClick={handleSave}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
