"use client";

import { trackEvent } from "@/lib/analytics";

interface SimulatorCtaProps {
  url: string;
  location?: "product" | "category";
  productSlug?: string;
}

export function SimulatorCta({
  url,
  location = "product",
  productSlug,
}: SimulatorCtaProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="simulator-cta"
      onClick={() =>
        trackEvent("simulator_click", { location, product_slug: productSlug })
      }
      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
    >
      Simular uniforme →
    </a>
  );
}
