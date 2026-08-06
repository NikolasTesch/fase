"use client";

import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const SUGGESTIONS = [
  "Qual o pedido mínimo?",
  "Tabela de tamanhos",
  "Solicitar um orçamento",
  "Quais esportes atendem?",
];

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText("");
  };

  const handleChipClick = (suggestion: string) => {
    if (disabled) return;
    onSend(suggestion);
  };

  return (
    <div className="p-3 border-t border-border/60 bg-background/95 backdrop-blur-sm space-y-2.5">
      {/* Sugestões rápidas (Chips) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {SUGGESTIONS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleChipClick(chip)}
            disabled={disabled}
            className={cn(
              "shrink-0 rounded-full border border-border/80 bg-muted/50 px-2.5 py-1 text-muted-foreground",
              "hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            )}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Formulário de Envio */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite sua dúvida para a Fabi..."
          disabled={disabled}
          className={cn(
            "flex-1 rounded-xl border border-input bg-muted/40 px-3.5 py-2 text-sm text-foreground",
            "placeholder:text-muted-foreground/70",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:bg-background",
            "disabled:opacity-50 transition-colors"
          )}
        />

        <button
          type="submit"
          disabled={disabled || !text.trim()}
          aria-label="Enviar mensagem"
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-xl font-medium",
            "bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
          )}
        >
          <SendHorizontal className="size-4" />
        </button>
      </form>
    </div>
  );
}
