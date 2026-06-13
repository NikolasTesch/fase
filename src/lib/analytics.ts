type EventName =
  | "whatsapp_click"
  | "simulator_click"
  | "lead_submit"
  | "orcamento_step"
  | "page_view";

interface EventParams {
  location?: "hero" | "product" | "category" | "fab" | "footer";
  product_slug?: string;
  step?: number;
  sport?: string;
  source?: string;
  page_path?: string;
}

declare global {
  interface Window {
    dataLayer?: object[];
  }
}

export function trackEvent(name: EventName, params?: EventParams) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: name, ...params });
}
