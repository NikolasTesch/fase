"use client";

import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { buildWhatsAppUrl } from "@/lib/site";

interface ProductWhatsAppCtaProps {
  productName: string;
  categoryName: string;
}

export function ProductWhatsAppCta({
  productName,
  categoryName,
}: ProductWhatsAppCtaProps) {
  const message = `Olá Fase Sport! Vi o modelo ${productName} e quero um orçamento para uniforme de ${categoryName}.`;
  const href = buildWhatsAppUrl(message);

  return (
    <Button
      size="lg"
      data-testid="product-whatsapp-cta"
      render={
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("whatsapp_click", { location: "product" })}
        />
      }
    >
      <MessageCircle aria-hidden="true" />
      Chamar no WhatsApp
    </Button>
  );
}
