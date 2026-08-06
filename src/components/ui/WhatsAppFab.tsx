"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Sparkles, X } from "lucide-react";

import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { FabiChatWidget } from "@/components/chat/FabiChatWidget";

export function WhatsAppFab() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [pulse, setPulse] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    // Mostrar tooltip após 3 segundos
    const tooltipTimer = setTimeout(() => setShowTooltip(true), 3000);
    // Parar pulsar após 10 segundos
    const pulseTimer = setTimeout(() => setPulse(false), 10000);
    return () => {
      clearTimeout(tooltipTimer);
      clearTimeout(pulseTimer);
    };
  }, []);

  const handleFabClick = () => {
    trackEvent("fabi_chat_open", { location: "fab" });
    setShowTooltip(false);
    setIsChatOpen((prev) => !prev);
  };

  return (
    <>
      <FabiChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <div className="fixed right-6 bottom-6 z-50 flex items-center gap-3">
        {/* Tooltip */}
        {!isChatOpen && (
          <div
            className={cn(
              "rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground shadow-lg transition-all duration-300",
              showTooltip
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0 pointer-events-none"
            )}
          >
            Fale com a Fabi
            <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 border-4 border-transparent border-l-accent" />
          </div>
        )}

        <button
          type="button"
          onClick={handleFabClick}
          aria-label="Falar com a Fabi AI"
          data-testid="whatsapp-fab"
          className={cn(
            "relative inline-flex size-14 items-center justify-center rounded-full cursor-pointer",
            "bg-gradient-to-br from-primary via-brand-dark to-accent text-primary-foreground",
            "shadow-lg hover:shadow-xl transition-all duration-300",
            "hover:scale-110 active:scale-95",
            "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/50",
            pulse && !isChatOpen && "animate-[pulse-whatsapp_2s_ease-in-out_3]"
          )}
        >
          {isChatOpen ? (
            <X className="size-6" />
          ) : (
            <>
              <MessageCircle className="size-7" />
              <Sparkles className="absolute top-2 right-2 size-3.5 text-amber-300 animate-pulse" />
            </>
          )}
        </button>
      </div>
    </>
  );
}
