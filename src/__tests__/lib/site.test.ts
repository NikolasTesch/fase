import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildWhatsAppUrl } from "@/lib/site";

describe("buildWhatsAppUrl", () => {
  const originalWhatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "5527999999999";
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = originalWhatsAppNumber;
  });

  it("returns a URL starting with https://wa.me/", () => {
    expect(buildWhatsAppUrl()).toMatch(/^https:\/\/wa\.me\//);
  });

  it("URL-encodes a custom message", () => {
    const message = "Orçamento: 20 camisas de futebol?";
    const url = buildWhatsAppUrl(message);
    expect(url).toContain(encodeURIComponent(message));
    expect(url).not.toContain(" ");
  });

  it("uses the default message when none is provided", () => {
    const url = buildWhatsAppUrl();
    expect(url).toContain(
      encodeURIComponent("Olá Fase Sport! Gostaria de solicitar um orçamento."),
    );
  });

  it("places the message after the ?text= query parameter", () => {
    const url = buildWhatsAppUrl("teste");
    expect(url).toContain("?text=teste");
  });
});

