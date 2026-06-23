"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Image as ImageIcon, Upload, Trash2, Loader2, Ruler } from "lucide-react";

interface SizeTableRowProps {
  category: {
    id: string;
    name: string;
    slug: string;
    sizeTableUrl: string | null;
  };
  index: number;
}

export function SizeTableRow({ category, index }: SizeTableRowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sizeTableUrl, setSizeTableUrl] = useState<string | null>(
    category.sizeTableUrl
  );
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("categoryId", category.id);

    try {
      const res = await fetch("/api/admin/categories/size-table", {
        method: "POST",
        body: fd,
      });

      if (res.ok) {
        const data = await res.json();
        setSizeTableUrl(data.url);
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

  async function handleRemove() {
    if (
      !confirm(
        `Tem certeza que deseja remover a tabela de tamanhos de "${category.name}"?`
      )
    )
      return;

    setUploading(true);
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sizeTableUrl: "" }),
      });

      if (res.ok) {
        setSizeTableUrl(null);
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
      className="border-t border-border hover:bg-muted/30 transition-colors duration-150"
    >
      <td className="px-4 py-3.5 font-medium">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Ruler size={14} className="text-muted-foreground" />
          </div>
          <span>{category.name}</span>
        </div>
      </td>

      <td className="px-4 py-3.5 text-muted-foreground font-mono text-xs">
        {category.slug}
      </td>

      <td className="px-4 py-3.5">
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="relative w-24 h-24 rounded-xl border border-border bg-muted/50 flex items-center justify-center cursor-pointer group select-none overflow-hidden transition-colors hover:border-muted-foreground/30"
        >
          {uploading ? (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : sizeTableUrl ? (
            <>
              <Image
                src={sizeTableUrl}
                alt={`Tabela de tamanhos - ${category.name}`}
                width={96}
                height={96}
                className="object-contain w-full h-full transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center text-white">
                <Upload size={16} />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-1 right-1 p-1 bg-destructive hover:bg-destructive/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-md z-10"
              >
                <Trash2 size={12} />
              </button>
            </>
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-muted-foreground/40 transition-transform group-hover:scale-110" />
              <span className="absolute bottom-2 text-[10px] text-muted-foreground/50 font-medium group-hover:text-muted-foreground/70 transition-colors">
                Upload
              </span>
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

      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-all duration-200 bg-background disabled:opacity-50"
          >
            <Upload size={12} />
            {sizeTableUrl ? "Trocar imagem" : "Fazer upload"}
          </button>

          {sizeTableUrl && (
            <button
              onClick={handleRemove}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5 transition-all duration-200 bg-background disabled:opacity-50"
            >
              <Trash2 size={12} />
              Remover
            </button>
          )}
        </div>
      </td>
    </motion.tr>
  );
}
