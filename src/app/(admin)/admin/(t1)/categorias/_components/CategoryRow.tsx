"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Image as ImageIcon, Upload, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryRowProps {
  category: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    iconUrl: string | null;
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(category.imageUrl);
  const [uploading, setUploading] = useState(false);

  async function save(patch: object) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        console.error("[CategoryRow.save] erro", await res.json().catch(() => ({})));
      }
    } catch (err) {
      console.error("[CategoryRow.save] exceção", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("categoryId", category.id);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });

      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.url);
      } else {
        const data = await res.json();
        alert(data.message || "Erro no upload");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar imagem");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleRemoveImage() {
    if (!confirm("Tem certeza que deseja remover a imagem desta categoria?")) return;

    setUploading(true);
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: "" }),
      });

      if (res.ok) {
        setImageUrl(null);
      } else {
        alert("Erro ao remover imagem");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao remover imagem");
    } finally {
      setUploading(false);
    }
  }

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25, ease: "easeOut" }}
      className="border-t border-border hover:bg-accent/5 transition-colors duration-150"
    >
      <td className="px-4 py-3.5">
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="relative w-12 h-12 rounded-xl border border-border bg-muted/50 flex items-center justify-center cursor-pointer group select-none overflow-hidden transition-colors hover:border-muted-foreground/30"
        >
          {uploading ? (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt={category.name}
                width={48}
                height={48}
                className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center text-white">
                <Upload size={14} />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                className="absolute top-1 right-1 p-1 bg-destructive hover:bg-destructive/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-md"
              >
                <Trash2 size={12} />
              </button>
            </>
          ) : (
            <>
              <ImageIcon className="w-5 h-5 text-muted-foreground/60 transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                <Upload className="w-4 h-4 text-muted-foreground" />
              </div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </div>
      </td>
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
          className="w-16 rounded-lg border border-border px-2 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-colors"
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
