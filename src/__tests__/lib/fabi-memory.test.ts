import { describe, it, expect } from "vitest";
import { extractTriageState, getFabiContext } from "@/lib/rag/fabi";

describe("Memória de Sessão e Triagem Multi-Turno (Item 4)", () => {
  it("deve extrair o esporte, quantidade, nome e telefone de uma conversa multi-turno", () => {
    const history = [
      { role: "user", content: "Olá, me chamo Roberto!" },
      { role: "assistant", content: "Olá Roberto, como posso te ajudar?" },
      { role: "user", content: "Quero cotar 25 peças de uniformes de basquete." },
      { role: "assistant", content: "Ótimo! Temos modelos incríveis para basquete." },
      { role: "user", content: "Meu whatsapp é 73999887766." },
    ];

    const state = extractTriageState(history);

    expect(state).not.toBeNull();
    expect(state?.customerName).toBe("Roberto");
    expect(state?.detectedSport).toBe("Basquete");
    expect(state?.detectedQuantity).toBe(25);
    expect(state?.customerPhone).toBe("73999887766");
  });

  it("deve injetar o bloco de Estado da Triagem no contexto RAG", async () => {
    const history = [
      { role: "user", content: "Sou o Lucas e preciso de 30 camisas de futebol. Meu Zap é 73999112233" },
    ];

    const context = await getFabiContext(history);

    expect(context.contextText).toContain("ESTADO DA TRIAGEM DA SESSÃO ATUAL");
    expect(context.contextText).toContain("Lucas");
    expect(context.contextText).toContain("Futebol");
    expect(context.contextText).toContain("30 unidades");
  });

  it("deve extrair corretamente quantidade e tipo de produto para pedidos de kits", () => {
    const history = [
      { role: "user", content: "Gostaria de um orçamento para 20 kits de futebol." },
    ];

    const state = extractTriageState(history);

    expect(state).not.toBeNull();
    expect(state?.detectedSport).toBe("Futebol");
    expect(state?.detectedQuantity).toBe(20);
    expect(state?.detectedProductType).toBe("Kit Completo (Camisa + Shorts)");
  });
});
