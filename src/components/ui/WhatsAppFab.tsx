"use client";

import { MessageCircle } from "lucide-react";

import { buildWhatsAppUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

export function WhatsAppFab() {
  return (
    <a
      href={buildWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      data-testid="whatsapp-fab"
      className={cn(
        "fixed right-6 bottom-6 z-50 inline-flex size-14 items-center justify-center rounded-full",
        "bg-primary text-primary-foreground shadow-lg transition-transform",
        "hover:scale-105 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      )}
    >
      <MessageCircle className="size-7" />
    </a>
  );
}
