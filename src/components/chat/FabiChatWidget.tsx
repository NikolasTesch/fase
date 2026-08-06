"use client";

import { useState } from "react";
import { X, MessageCircle, RefreshCw } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/site";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { FabiAvatar } from "./FabiAvatar";
import { ChatMessageList, ChatMessage } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";

interface FabiChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-1",
    role: "assistant",
    content:
      "Olá! Eu sou a **Fabi**, sua assistente virtual da **Fase Sport**! \n\nEstou aqui para tirar dúvidas sobre uniformes personalizados, tecidos, prazos e tabelas de medidas. Como posso te ajudar hoje?",
    createdAt: new Date(),
  },
];

export function FabiChatWidget({ isOpen, onClose }: FabiChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (userContent: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userContent,
      createdAt: new Date(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);
    trackEvent("fabi_chat_message_sent", { text_length: userContent.length });

    try {
      const res = await fetch("/api/chat/fabi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        throw new Error("Erro na API da Fabi");
      }

      if (!res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      const assistantMsgId = `fabi-${Date.now()}`;
      let assistantContent = "";

      // Adiciona slot da mensagem da assistente
      setMessages((prev) => [
        ...prev,
        { id: assistantMsgId, role: "assistant", content: "", createdAt: new Date() },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            if (dataStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(dataStr);
              const delta = parsed.choices?.[0]?.delta?.content || "";
              if (delta) {
                assistantContent += delta;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: assistantContent }
                      : msg
                  )
                );
              }
            } catch {
              // Ignorar erros de parse parciais
            }
          }
        }
      }
    } catch (err) {
      console.error("[FabiChatWidget]", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "Desculpe, tive um pequeno imprevisto na conexão. Mas você pode falar diretamente com nossa equipe no WhatsApp!",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed right-4 bottom-24 z-50 flex w-[92vw] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-border/80 shadow-2xl",
        "bg-background/95 backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
      )}
    >
      {/* Header do Widget */}
      <div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-primary/10 via-background to-accent/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <FabiAvatar size="md" />
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              Fabi
              <span className="rounded-full bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 text-[10px] font-medium border border-emerald-500/20">
                IA Fase Sport
              </span>
            </h3>
            <p className="text-[11px] text-muted-foreground">Assistente Virtual 24h</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleResetChat}
            title="Reiniciar conversa"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <RefreshCw className="size-4" />
          </button>

          <a
            href={buildWhatsAppUrl("Olá Fabi, prefiro continuar no WhatsApp!")}
            target="_blank"
            rel="noopener noreferrer"
            title="Ir para WhatsApp"
            className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-500/10 transition-colors"
          >
            <MessageCircle className="size-4" />
          </a>

          <button
            type="button"
            onClick={onClose}
            title="Fechar chat"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Lista de Mensagens */}
      <ChatMessageList messages={messages} isLoading={isLoading} />

      {/* Entrada de Texto */}
      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
