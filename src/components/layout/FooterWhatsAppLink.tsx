"use client";

import { trackEvent } from "@/lib/analytics";
import { buildWhatsAppUrl } from "@/lib/site";

export function FooterWhatsAppLink() {
  return (
    <a
      href={buildWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent("whatsapp_click", { location: "footer" })}
      className="transition-colors hover:text-primary-foreground"
    >
      WhatsApp
    </a>
  );
}
