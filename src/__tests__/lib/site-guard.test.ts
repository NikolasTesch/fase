import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { buildWhatsAppUrl } from "@/lib/site";

describe("buildWhatsAppUrl — guard sem número", () => {
  const original = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = original;
  });

  it("retorna '/orcamento' quando número não está configurado", () => {
    const url = buildWhatsAppUrl();
    expect(url).toBe("/orcamento");
    expect(url).not.toContain("wa.me");
  });

  it("nunca gera 'wa.me/' sem número válido", () => {
    const url = buildWhatsAppUrl("Quero um orçamento");
    expect(url).not.toMatch(/wa\.me\/$/);
    expect(url).not.toMatch(/wa\.me\/\?/);
  });
});
