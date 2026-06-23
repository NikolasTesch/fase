"use client";

import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";

import { trackEvent } from "@/lib/analytics";
import { buildWhatsAppUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

export function WhatsAppFab() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [pulse, setPulse] = useState(true);

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

  return (
    <div className="fixed right-6 bottom-6 z-50 flex items-center gap-3">
      {/* Tooltip */}
      <div
        className={cn(
          "rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground shadow-lg transition-all duration-300",
          showTooltip
            ? "translate-y-0 opacity-100"
            : "translate-y-2 opacity-0 pointer-events-none"
        )}
      >
        Fale conosco!
        <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 border-4 border-transparent border-l-accent" />
      </div>

      <a
        href={buildWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          trackEvent("whatsapp_click", { location: "fab" });
          setShowTooltip(false);
        }}
        aria-label="Falar no WhatsApp"
        data-testid="whatsapp-fab"
        className={cn(
          "inline-flex size-14 items-center justify-center rounded-full",
          "bg-gradient-to-br from-primary to-brand-dark text-primary-foreground",
          "shadow-lg hover:shadow-xl transition-all duration-300",
          "hover:scale-110 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/50",
          pulse && "animate-[pulse-whatsapp_2s_ease-in-out_3]"
        )}
      >
        <MessageCircle className="size-7" />
      </a>
    </div>
  );
}
