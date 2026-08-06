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
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

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
          sessionId,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className={cn(
          "flex w-full max-w-[460px] h-[90vh] max-h-[640px] flex-col overflow-hidden rounded-3xl border border-border/80 shadow-2xl",
          "bg-background/95 backdrop-blur-md transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-6"
        )}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-primary/15 via-background to-emerald-500/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <FabiAvatar size="md" />
              <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                Fabi
                <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-semibold border border-emerald-500/20">
                  Online
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">Especialista em Uniformes Fase Sport</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleResetChat}
              title="Reiniciar conversa"
              className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <RefreshCw className="size-4" />
            </button>

            <a
              href={buildWhatsAppUrl("Olá Fabi, prefiro falar direto com a equipe no WhatsApp!")}
              target="_blank"
              rel="noopener noreferrer"
              title="Ir para WhatsApp"
              className="rounded-xl p-2 text-emerald-600 hover:bg-emerald-500/10 transition-colors"
            >
              <MessageCircle className="size-4" />
            </a>

            <button
              type="button"
              onClick={onClose}
              title="Fechar modal"
              className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Lista de Mensagens */}
        <ChatMessageList
          messages={messages}
          isLoading={isLoading}
          onQuickSelect={handleSendMessage}
        />

        {/* Entrada de Texto */}
        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
