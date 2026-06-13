"use client";

import { trackEvent } from "@/lib/analytics";

interface SimulatorCtaProps {
  url: string;
  location?: "product" | "category";
  productSlug?: string;
  testId?: string;
}

export function SimulatorCta({
  url,
  location = "product",
  productSlug,
  testId = "simulator-cta",
}: SimulatorCtaProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={testId}
      onClick={() =>
        trackEvent("simulator_click", { location, product_slug: productSlug })
      }
      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
    >
      Simular uniforme →
    </a>
  );
}
