"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  AlertTriangle,
  Download,
  Image as ImageIcon,
  Info,
  Palette,
  Search,
  ShoppingBag,
  Star,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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

interface ProductArt {
  id: string;
  previewUrl: string;
  originalFileName: string;
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
  art: ProductArt | null;
}

interface ProductFormProps {
  categories: Category[];
  product?: Product;
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border/60 px-6 py-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

const cardClass =
  "rounded-3xl border border-border/80 bg-card/60 backdrop-blur-sm overflow-hidden shadow-sm";

const fileInputClass =
  "block w-full cursor-pointer rounded-lg border border-input bg-background text-sm text-muted-foreground transition-colors file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground hover:file:bg-muted/70 disabled:pointer-events-none disabled:opacity-50";

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
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);

  // Arte — upload avulso (novo) ou vinculada (edição)
  const [art, setArt] = useState<ProductArt | null>(
    product?.art
      ? {
          id: product.art.id,
          previewUrl: product.art.previewUrl,
          originalFileName: product.art.originalFileName,
        }
      : null
  );
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [uploadingArt, setUploadingArt] = useState(false);
  const [removingArt, setRemovingArt] = useState(false);
  const [artError, setArtError] = useState<string | null>(null);
  const [confirmArtRemoveOpen, setConfirmArtRemoveOpen] = useState(false);

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

    // Ao editar, o slug é imutável — não enviá-lo evita rejeição do schema da API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { slug, ...formWithoutSlug } = form;
    const payload = isEditing ? formWithoutSlug : form;

    const res = await fetch(url, {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        // No modo novo o upload de arte é avulso; o artId vincula no POST.
        // No modo edição o backend já vinculou via productId no upload.
        ...(!isEditing ? { artId: art?.id ?? null } : {}),
        simulatorUrl: payload.simulatorUrl || undefined,
        subcategoryId: payload.subcategoryId || null,
        minQty: Number(payload.minQty),
        sortOrder: Number(payload.sortOrder),
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
    const res = await fetch(`/api/admin/products/${product!.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message ?? "Erro ao desativar produto");
      return;
    }
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
    const res = await fetch(`/api/admin/products/images/${imageId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message ?? "Erro ao remover imagem");
      return;
    }
    setImages((prev) => prev.filter((i) => i.id !== imageId));
  }

  async function handleSetPrimary(imageId: string) {
    const res = await fetch(`/api/admin/products/images/${imageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPrimary: true }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message ?? "Erro ao definir imagem como principal");
      return;
    }
    setImages((prev) => prev.map((i) => ({ ...i, isPrimary: i.id === imageId })));
    router.refresh();
  }

  async function handleArtUpload() {
    if (!previewFile || !originalFile) return;

    setUploadingArt(true);
    setArtError(null);

    const fd = new FormData();
    fd.append("file", previewFile);
    fd.append("original", originalFile);
    if (product?.id) fd.append("productId", product.id);

    try {
      const res = await fetch("/api/admin/products/art", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setArtError(data.message ?? "Erro ao enviar arte");
        return;
      }
      const created = await res.json();
      setArt({
        id: created.id,
        previewUrl: created.previewUrl,
        originalFileName: created.originalFileName,
      });
      setPreviewFile(null);
      setOriginalFile(null);
      if (product?.id) router.refresh();
    } finally {
      setUploadingArt(false);
    }
  }

  async function handleRemoveArt() {
    if (!art) return;

    setRemovingArt(true);
    setArtError(null);

    try {
      const res = await fetch(`/api/admin/products/art/${art.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setArtError(data.message ?? "Erro ao remover arte");
        return;
      }
      setArt(null);
      setConfirmArtRemoveOpen(false);
      if (isEditing) router.refresh();
    } finally {
      setRemovingArt(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* 1. Informações básicas */}
      <section className={cardClass}>
        <SectionHeader
          icon={<Info size={16} />}
          title="Informações básicas"
          subtitle="Dados principais exibidos no catálogo."
        />
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="product-name">Nome *</Label>
            <Input
              id="product-name"
              value={form.name}
              aria-describedby={error ? "product-form-error" : undefined}
              onChange={(e) => {
                set("name", e.target.value);
                if (!isEditing && !slugManuallyEdited) {
                  set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                }
              }}
            />
          </div>
          <div>
            <Label htmlFor="product-slug">Slug *</Label>
            <Input
              id="product-slug"
              value={form.slug}
              disabled={isEditing}
              onChange={(e) => {
                set("slug", e.target.value);
                setSlugManuallyEdited(true);
              }}
            />
            {isEditing && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Slug definido na criação e não pode ser alterado.
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="product-description">Descrição</Label>
            <Textarea
              id="product-description"
              rows={4}
              className="resize-none"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-border/60 px-6 py-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => set("isFeatured", e.target.checked)}
              className="size-4 accent-primary"
            />
            Destaque
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="size-4 accent-primary"
            />
            Ativo
          </label>
        </div>
      </section>

      {/* 2. Categorização */}
      <section className={cardClass}>
        <SectionHeader
          icon={<Tag size={16} />}
          title="Categorização"
          subtitle="Defina onde o produto aparece no catálogo."
        />
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="product-category">Categoria *</Label>
            <Select
              id="product-category"
              value={form.categoryId}
              onChange={(e) => {
                set("categoryId", e.target.value);
                set("subcategoryId", "");
              }}
            >
              <option value="">Selecione...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="product-subcategory">Sub-categoria</Label>
            <Select
              id="product-subcategory"
              value={form.subcategoryId}
              disabled={!selectedCategory?.subcategories.length}
              onChange={(e) => set("subcategoryId", e.target.value)}
            >
              <option value="">Nenhuma</option>
              {selectedCategory?.subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </Select>
            {selectedCategory?.subcategories.length ? (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Opcional — depende da categoria selecionada.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* 3. Venda */}
      <section className={cardClass}>
        <SectionHeader
          icon={<ShoppingBag size={16} />}
          title="Venda"
          subtitle="Configurações comerciais e do simulador."
        />
        <div className="grid gap-5 p-6 sm:grid-cols-3">
          <div>
            <Label htmlFor="product-fabric">Tecido</Label>
            <Input
              id="product-fabric"
              value={form.fabric}
              onChange={(e) => set("fabric", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="product-min-qty">Qtd. mínima</Label>
            <Input
              id="product-min-qty"
              type="number"
              min={1}
              value={form.minQty}
              onChange={(e) => set("minQty", Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="product-sort-order">Ordem</Label>
            <Input
              id="product-sort-order"
              type="number"
              value={form.sortOrder}
              onChange={(e) => set("sortOrder", Number(e.target.value))}
            />
          </div>
          <div className="sm:col-span-3">
            <Label htmlFor="product-simulator-url">Link do Simulador</Label>
            <Input
              id="product-simulator-url"
              placeholder="https://simulador.fasesport.com/..."
              value={form.simulatorUrl}
              onChange={(e) => set("simulatorUrl", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* 4. SEO */}
      <section className={cardClass}>
        <SectionHeader
          icon={<Search size={16} />}
          title="SEO"
          subtitle="Otimização para mecanismos de busca."
        />
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="product-seo-title">SEO Title</Label>
            <Input
              id="product-seo-title"
              value={form.seoTitle}
              onChange={(e) => set("seoTitle", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="product-seo-desc">SEO Description</Label>
            <Input
              id="product-seo-desc"
              value={form.seoDesc}
              onChange={(e) => set("seoDesc", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* 5. Imagens — upload apenas no modo edição */}
      <section className={cardClass}>
        <SectionHeader
          icon={<ImageIcon size={16} />}
          title="Imagens"
          subtitle={
            isEditing
              ? "Fotos exibidas no catálogo e na página do produto."
              : "Disponível após salvar o produto."
          }
        />
        {isEditing ? (
          <div className="p-6">
            {images.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
                  >
                    <Image
                      src={img.url}
                      alt={img.altText ?? ""}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                    {img.isPrimary && (
                      <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                        Principal
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      aria-label={`Remover imagem${img.isPrimary ? " principal" : ""}`}
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-destructive/90 text-white transition-colors hover:bg-destructive"
                    >
                      <X size={14} />
                    </button>
                    {!img.isPrimary && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 pt-4">
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(img.id)}
                          aria-label="Definir imagem como principal"
                          className="flex w-full items-center justify-center gap-1 rounded-lg bg-white/15 py-1 text-[10px] font-medium text-white transition-colors hover:bg-white/25"
                        >
                          <Star size={11} />
                          Definir como principal
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                <ImageIcon size={24} className="opacity-40" />
                <p className="text-sm">Nenhuma imagem adicionada.</p>
              </div>
            )}
            <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2.5 text-sm transition-colors hover:bg-muted">
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
          </div>
        ) : (
          <div className="p-6">
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-8 text-center text-muted-foreground">
              <ImageIcon size={24} className="opacity-40" />
              <p className="text-sm">Salve o produto primeiro para adicionar imagens.</p>
            </div>
          </div>
        )}
      </section>

      {/* 6. Arte */}
      <section className={cardClass}>
        <SectionHeader
          icon={<Palette size={16} />}
          title="Arte"
          subtitle="Preview público e arquivo original da arte do produto."
        />
        <div className="space-y-5 p-6">
          {artError && (
            <div
              id="art-error"
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{artError}</span>
            </div>
          )}

          {art ? (
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:w-44">
                <Image
                  src={art.previewUrl}
                  alt="Preview da arte do produto"
                  fill
                  sizes="176px"
                  className="object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-col gap-1.5">
                <p className="text-sm font-semibold text-foreground">Arte do produto</p>
                <p className="truncate text-sm text-muted-foreground" title={art.originalFileName}>
                  {art.originalFileName}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    href={`/api/admin/products/art/${art.id}/download`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
                  >
                    <Download size={14} />
                    Baixar original
                  </a>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setConfirmArtRemoveOpen(true)}
                  >
                    <Trash2 size={14} />
                    Remover arte
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-border p-4">
              <p className="mb-4 text-sm text-muted-foreground">
                Envie o preview (PNG/JPG/WebP/GIF) e o arquivo original da arte
                (CDR/SVG/PDF/AI/EPS ou imagem). O preview fica público na página do
                produto; o original é armazenado privado no Google Drive.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="art-preview-file">Imagem de preview</Label>
                  <input
                    id="art-preview-file"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    disabled={uploadingArt}
                    aria-describedby={artError ? "art-error" : undefined}
                    onChange={(e) => setPreviewFile(e.target.files?.[0] ?? null)}
                    className={fileInputClass}
                  />
                  {previewFile && (
                    <p className="mt-1.5 truncate text-xs text-muted-foreground">
                      {previewFile.name}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="art-original-file">Arquivo original</Label>
                  <input
                    id="art-original-file"
                    type="file"
                    accept=".cdr,.svg,.pdf,.ai,.eps,.png,.jpg,.jpeg,.webp,.gif"
                    disabled={uploadingArt}
                    aria-describedby={artError ? "art-error" : undefined}
                    onChange={(e) => setOriginalFile(e.target.files?.[0] ?? null)}
                    className={fileInputClass}
                  />
                  {originalFile && (
                    <p className="mt-1.5 truncate text-xs text-muted-foreground">
                      {originalFile.name}
                    </p>
                  )}
                </div>
              </div>
              <Button
                className="mt-4 gap-2"
                onClick={handleArtUpload}
                disabled={!previewFile || !originalFile || uploadingArt}
              >
                <Upload size={15} />
                {uploadingArt ? "Enviando..." : "Enviar arte"}
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="px-6 pb-4">
            <div
              id="product-form-error"
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <footer className="flex flex-col gap-3 border-t border-border/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          {isEditing && (
            <Button variant="destructive" onClick={handleDelete}>
              Desativar produto
            </Button>
          )}
          <div className="flex gap-3 sm:ml-auto">
            <Button variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button disabled={saving} onClick={handleSave}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </footer>
      </section>

      {/* Confirmação de remoção de arte */}
      <Dialog open={confirmArtRemoveOpen} onOpenChange={setConfirmArtRemoveOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Remover arte?</DialogTitle>
          <DialogDescription className="mt-1.5">
            O preview e o arquivo original serão excluídos permanentemente. Esta ação não
            pode ser desfeita.
          </DialogDescription>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmArtRemoveOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={removingArt}
              onClick={handleRemoveArt}
              className="gap-1.5"
            >
              <Trash2 size={14} />
              {removingArt ? "Removendo..." : "Remover"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
