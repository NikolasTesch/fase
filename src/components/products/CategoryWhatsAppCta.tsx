"use client";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

interface CategoryWhatsAppCtaProps {
  url: string;
}

export function CategoryWhatsAppCta({ url }: CategoryWhatsAppCtaProps) {
  return (
    <Button
      size="lg"
      variant="outline"
      render={
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("whatsapp_click", { location: "category" })}
        />
      }
    >
      Chamar no WhatsApp
    </Button>
  );
}
