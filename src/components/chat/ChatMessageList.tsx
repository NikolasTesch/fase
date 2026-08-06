import { useEffect, useRef, useState } from "react";
import { MessageCircle, User, ThumbsUp, ThumbsDown, ArrowRight, Copy, Check, Sparkles } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import { FabiAvatar } from "./FabiAvatar";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  feedback?: number | null;
  createdAt?: Date;
}

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  onFeedback?: (messageId: string, feedback: number) => void;
  onQuickSelect?: (text: string) => void;
}

const QUICK_CHIPS = [
  { label: "⚽ Cotar 20 camisas de futebol", text: "Quanto custa 20 camisas de futebol?" },
  { label: "🚴 Modelos para Ciclismo", text: "Quais modelos e tecidos vocês têm para ciclismo?" },
  { label: "📏 Medidas Babylook", text: "Qual a tabela de medidas do modelo Babylook?" },
  { label: "🚚 Prazo de entrega", text: "Qual o prazo médio de produção e entrega?" },
];

/**
 * Renderizador com suporte completo a marcadores em negrito (**texto**) e links Markdown ([Texto](/url))
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
              const parts = line.split(/(\[.*?\]\(.*?\)|(?:\*\*.*?\*\*))/g);
              return (
                <span key={lIdx}>
                  {lIdx > 0 && <br />}
                  {parts.map((part, partIdx) => {
                    if (part.startsWith("[") && part.includes("](")) {
                      const match = part.match(/\[(.*?)\]\((.*?)\)/);
                      if (match) {
                        const linkText = match[1];
                        const linkUrl = match[2];
                        const isExternal = linkUrl.startsWith("http");

                        return (
                          <a
                            key={partIdx}
                            href={linkUrl}
                            target={isExternal ? "_blank" : "_self"}
                            rel={isExternal ? "noopener noreferrer" : undefined}
                            className="font-bold text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                          >
                            {linkText}
                          </a>
                        );
                      }
                    }

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

export function ChatMessageList({ messages, isLoading, onFeedback, onQuickSelect }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [votedMessages, setVotedMessages] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleVote = async (msgId: string, val: number) => {
    setVotedMessages((prev) => ({ ...prev, [msgId]: val }));
    if (onFeedback) onFeedback(msgId, val);

    try {
      await fetch("/api/chat/fabi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: msgId, feedback: val }),
      });
    } catch (err) {
      console.error("[handleVote]", err);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[460px] scrollbar-thin">
      {messages.map((msg, index) => {
        const isUser = msg.role === "user";
        const isFirstAssistantMsg = index === 0 && !isUser;
        const currentVote = votedMessages[msg.id] ?? msg.feedback;
        const isQuoteOrContact =
          !isUser &&
          (msg.content.toLowerCase().includes("orçamento") ||
            msg.content.toLowerCase().includes("valor unitário") ||
            msg.content.toLowerCase().includes("whatsapp") ||
            msg.content.toLowerCase().includes("consultor"));

        return (
          <div
            key={msg.id}
            className={cn(
              "flex items-start gap-2.5 max-w-[90%]",
              isUser ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            {!isUser ? (
              <FabiAvatar size="sm" />
            ) : (
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-xs shadow-sm">
                <User className="size-4" />
              </div>
            )}

            <div className="flex flex-col gap-1.5 w-full">
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 shadow-sm text-sm transition-all relative group",
                  isUser
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted/80 text-foreground border border-border/50 rounded-tl-none"
                )}
              >
                <FormattedText text={msg.content} />

                {/* Quick Action Chips para primeira interação */}
                {isFirstAssistantMsg && onQuickSelect && (
                  <div className="mt-4 pt-3 border-t border-border/50 space-y-2">
                    <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                      <Sparkles className="size-3 text-amber-500" /> Perguntas frequentes:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_CHIPS.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => onQuickSelect(chip.text)}
                          className="rounded-full bg-background hover:bg-primary/10 border border-border/70 hover:border-primary/40 px-3 py-1 text-xs font-medium text-foreground hover:text-primary transition-all cursor-pointer shadow-2xs"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card Destacado: Pedir no WhatsApp em 1-Clique */}
                {isQuoteOrContact && (
                  <div className="mt-3.5 pt-3 border-t border-border/50 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href={buildWhatsAppUrl("Olá Fabi! Fiz uma simulação de orçamento no chat e gostaria de dar início ao meu pedido com maquete 3D!")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "flex-1 group inline-flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold",
                          "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:shadow-lg transition-all duration-200"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <MessageCircle className="size-4 animate-pulse" />
                          Pedir no WhatsApp em 1-Clique
                        </span>
                        <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.id, msg.content)}
                        title="Copiar texto do orçamento"
                        className="p-2.5 rounded-xl border border-border/60 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <Check className="size-4 text-emerald-500" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Botões de Feedback 👍 / 👎 */}
              {!isUser && msg.content.length > 20 && (
                <div className="flex items-center gap-2 pl-1 text-[11px] text-muted-foreground">
                  <span>Resposta foi útil?</span>
                  <button
                    type="button"
                    onClick={() => handleVote(msg.id, 1)}
                    className={cn(
                      "p-1 rounded-md hover:bg-emerald-500/10 transition-colors cursor-pointer",
                      currentVote === 1 ? "text-emerald-500 font-bold" : "hover:text-emerald-500"
                    )}
                    title="Sim, útil"
                  >
                    <ThumbsUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVote(msg.id, -1)}
                    className={cn(
                      "p-1 rounded-md hover:bg-rose-500/10 transition-colors cursor-pointer",
                      currentVote === -1 ? "text-rose-500 font-bold" : "hover:text-rose-500"
                    )}
                    title="Não foi útil"
                  >
                    <ThumbsDown className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Indicador de Digitação (Typing Indicator) Realista */}
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground mr-auto">
          <FabiAvatar size="sm" />
          <div className="rounded-2xl rounded-tl-none bg-muted px-4 py-3 border border-border/40 flex items-center gap-2 shadow-sm">
            <span className="text-xs text-muted-foreground font-medium">Fabi está digitando</span>
            <div className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.3s]" />
              <span className="size-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]" />
              <span className="size-1.5 rounded-full bg-primary/70 animate-bounce" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
