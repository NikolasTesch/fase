"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function TestimonialToggle({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const [active, setActive] = useState(isActive);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    if (saving) return;
    const next = !active;
    
    // Atualização otimista
    setActive(next);
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });

      if (!res.ok) {
        // Reverte se a requisição falhou
        setActive(!next);
        const data = await res.json().catch(() => ({}));
        console.error("[TestimonialToggle] Erro ao atualizar status:", data);
      }
    } catch (err) {
      // Reverte em caso de exceção de rede
      setActive(!next);
      console.error("[TestimonialToggle] Exceção ao atualizar status:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      title={active ? "Marcar como Inativo" : "Marcar como Ativo"}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none border",
        active
          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
          : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
      )}
    >
      {saving ? (
        <Loader2 size={12} className="animate-spin text-current" />
      ) : (
        <span
          className={cn(
            "w-2 h-2 rounded-full transition-colors duration-200",
            active ? "bg-emerald-500" : "bg-muted-foreground/40"
          )}
        />
      )}
      <span>{active ? "Ativo" : "Inativo"}</span>
    </button>
  );
}
