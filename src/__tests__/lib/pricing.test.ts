import { describe, it, expect, beforeEach } from "vitest";
import { calculateEstimate, getPricingRulesContext } from "@/lib/rag/pricing/calculator";

describe("Módulo de Precificação RAG (Pricing)", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "5527999999999";
  });
  it("deve calcular orçamento base para 10 camisas de futebol sem desconto extra", () => {
    const res = calculateEstimate({
      productIdOrName: "camisa-futebol",
      quantity: 10,
    });

    expect(res).not.toBeNull();
    if (res) {
      expect(res.quantity).toBe(10);
      expect(res.discountPercentage).toBe(0);
      expect(res.finalUnitPrice).toBe(59.9);
      expect(res.totalPrice).toBe(599.0);
      expect(res.whatsAppUrl).toContain("wa.me");
      expect(res.whatsAppUrl).toContain("599");
    }
  });

  it("deve aplicar desconto de 10% para pedido de 50 camisas", () => {
    const res = calculateEstimate({
      productIdOrName: "camisa-futebol",
      quantity: 50,
    });

    expect(res).not.toBeNull();
    if (res) {
      expect(res.quantity).toBe(50);
      expect(res.discountPercentage).toBe(10);
      // Preço base R$ 59,90 - 10% = R$ 53,91
      expect(res.finalUnitPrice).toBe(53.91);
      expect(res.totalPrice).toBe(2695.5);
    }
  });

  it("deve incluir valor adicional de manga longa se selecionado", () => {
    const res = calculateEstimate({
      productIdOrName: "camisa-futebol",
      quantity: 10,
      addOnIds: ["manga-longa"],
    });

    expect(res).not.toBeNull();
    if (res) {
      // Preço base R$ 59,90 + R$ 10,00 = R$ 69,90
      expect(res.finalUnitPrice).toBe(69.9);
      expect(res.totalPrice).toBe(699.0);
      expect(res.whatsAppUrl).toContain("Manga%20Longa");
    }
  });

  it("deve gerar contexto textual completo para o prompt da Fabi", () => {
    const context = getPricingRulesContext();
    expect(context).toContain("TABELA DE PREÇOS E REGRAS COMERCIAIS FASE SPORT");
    expect(context).toContain("Camisa de Futebol Sublimada");
    expect(context).toContain("Descontos por quantidade");
    expect(context).toContain("Manga Longa");
  });
});
