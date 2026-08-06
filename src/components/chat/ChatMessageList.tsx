"use client";

import { useEffect, useRef } from "react";
import { MessageCircle, Bot, User } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import { FabiAvatar } from "./FabiAvatar";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
}

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

/**
 * Renderizador de texto simples com suporte a marcadores em negrito e quebras de linha em Markdown
 */
function FormattedText({ text }: { text: string }) {
  const paragraphs = text.split("\n\n");

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {paragraphs.map((p, pIdx) => {
        const lines = p.split("\n");
        return (
          <p key={pIdx}>
            {lines.map((line, lIdx) => {
              // Substitui **texto** por <strong>
              const parts = line.split(/(\*\*.*?\*\*)/g);
              return (
                <span key={lIdx}>
                  {lIdx > 0 && <br />}
                  {parts.map((part, partIdx) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                      return (
                        <strong key={partIdx} className="font-semibold text-foreground">
                          {part.slice(2, -2)}
                        </strong>
                      );
                    }
                    return part;
                  })}
                </span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[420px] scrollbar-thin">
      {messages.map((msg) => {
        const isUser = msg.role === "user";
        return (
          <div
            key={msg.id}
            className={cn(
              "flex items-start gap-2.5 max-w-[88%]",
              isUser ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            {!isUser ? (
              <FabiAvatar size="sm" />
            ) : (
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-semibold text-xs shadow-sm">
                <User className="size-4" />
              </div>
            )}

            <div
              className={cn(
                "rounded-2xl px-4 py-2.5 shadow-sm text-sm transition-all",
                isUser
                  ? "bg-primary text-primary-foreground rounded-tr-none"
                  : "bg-muted/80 text-foreground border border-border/50 rounded-tl-none"
              )}
            >
              <FormattedText text={msg.content} />

              {/* Botão de transição de WhatsApp se mencionado */}
              {!isUser &&
                (msg.content.toLowerCase().includes("whatsapp") ||
                  msg.content.toLowerCase().includes("orçamento") ||
                  msg.content.toLowerCase().includes("consultor")) && (
                  <div className="mt-3 pt-2 border-t border-border/40">
                    <a
                      href={buildWhatsAppUrl("Olá Fabi, gostaria de dar continuidade ao meu orçamento!")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold",
                        "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
                      )}
                    >
                      <MessageCircle className="size-3.5" />
                      Falar com Vendedor no WhatsApp
                    </a>
                  </div>
                )}
            </div>
          </div>
        );
      })}

      {/* Indicador de Digitação (Typing Indicator) */}
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground mr-auto">
          <FabiAvatar size="sm" />
          <div className="rounded-2xl rounded-tl-none bg-muted px-4 py-2.5 border border-border/40 flex items-center gap-1.5 shadow-sm">
            <span className="size-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.3s]" />
            <span className="size-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]" />
            <span className="size-2 rounded-full bg-primary/70 animate-bounce" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
