"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Loader2,
  Shirt,
} from "lucide-react";

interface ModalityItemData {
  id: string;
  lineId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  catalogLinkLabel: string | null;
  catalogLinkHref: string | null;
}

interface ModalitySectionCardProps {
  title: string;
  subtitle: string | null;
  items: ModalityItemData[];
}

function ModalityItemRow({
  item,
  index,
}: {
  item: ModalityItemData;
  index: number;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(item.imageUrl);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("itemId", item.id);

    try {
      const res = await fetch("/api/admin/modalities", {
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

  async function handleRemove() {
    if (
      !confirm(
        `Tem certeza que deseja remover a foto de "${item.name}"?`
      )
    )
      return;

    setUploading(true);
    try {
      const res = await fetch(`/api/admin/modalities/${item.id}`, {
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        duration: 0.25,
        ease: "easeOut",
      }}
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
    >
      {/* Image preview / upload */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className="relative w-20 h-20 shrink-0 rounded-lg border border-border bg-muted/50 flex items-center justify-center cursor-pointer group select-none overflow-hidden transition-colors hover:border-muted-foreground/30"
      >
        {uploading ? (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={item.name}
              width={80}
              height={80}
              className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
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
            <ImageIcon className="w-7 h-7 text-muted-foreground/40 transition-transform group-hover:scale-110" />
            <span className="absolute bottom-1.5 text-[9px] text-muted-foreground/40 font-medium">
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

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{item.name}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {item.description}
          </p>
        )}
        {item.catalogLinkLabel && item.catalogLinkHref && (
          <span className="inline-block mt-1 text-[10px] text-primary/70 font-medium">
            Link: {item.catalogLinkLabel} ({item.catalogLinkHref})
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-all duration-200 bg-background disabled:opacity-50"
        >
          <Upload size={12} />
          {imageUrl ? "Trocar" : "Upload"}
        </button>
        {imageUrl && (
          <button
            onClick={handleRemove}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5 transition-all duration-200 bg-background disabled:opacity-50"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function ModalitySectionCard({
  title,
  subtitle,
  items,
}: ModalitySectionCardProps) {
  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <div className="bg-muted/30 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Shirt size={15} className="text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      <div className="p-5 space-y-3">
        {items.map((item, i) => (
          <ModalityItemRow key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
