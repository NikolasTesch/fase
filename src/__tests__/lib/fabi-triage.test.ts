import { describe, it, expect, beforeEach } from "vitest";
import { buildFabiSystemPrompt } from "@/lib/rag/prompts";
import { buildWhatsAppUrl } from "@/lib/site";
import { executeFabiTool } from "@/lib/rag/tools";
import { extractTriageState, buildCleanWhatsAppMessage } from "@/lib/rag/fabi";

describe("Triagem Comercial RAG Fabi & WhatsApp 1-Clique", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "557332639911";
  });

  it("deve incluir o fluxo completo de triagem comercial no prompt da Fabi", () => {
    const prompt = buildFabiSystemPrompt("Contexto de Loja");

    expect(prompt).toContain("triagem comercial amigável");
    expect(prompt).toContain("1. **Modalidade e Produto**");
    expect(prompt).toContain("2. **Quantidade**");
    expect(prompt).toContain("3. **Detalhes da Arte/Personalização**");
    expect(prompt).toContain("4. **Nome e Telefone/WhatsApp**");
    expect(prompt).toContain("5. **Finalização com Mensagem Pronta para WhatsApp**");
    expect(prompt).toContain("https://wa.me/557332639911?text=");
  });

  it("deve extrair o estado da triagem corretamente a partir da conversa", () => {
    const history = [
      { role: "user", content: "Olá, me chamo João. Gostaria de orçar 20 kits de futebol para o meu time." },
      { role: "assistant", content: "Com certeza, João! Para 20 kits de futebol fica excelente." },
    ];

    const state = extractTriageState(history);
    expect(state).not.toBeNull();
    expect(state?.customerName).toBe("João");
    expect(state?.detectedQuantity).toBe(20);
    expect(state?.detectedSport).toBe("Futebol");
    expect(state?.detectedProductType).toBe("Kit Completo (Camisa + Shorts)");
  });

  it("deve gerar uma mensagem limpa e objetiva para o WhatsApp 1-Clique sem frases estranhas como 'você'", () => {
    const history = [
      { role: "user", content: "Quero saber o preço de 30 camisas de ciclismo. Meu nome é Carlos." },
      { role: "assistant", content: "Fiz a simulação para você: 30 camisas de ciclismo." },
    ];

    const msg = buildCleanWhatsAppMessage(history);
    expect(msg).toContain("• Item: Camisa Personalizada (Ciclismo)");
    expect(msg).toContain("• Quantidade: 30 unidades");
    expect(msg).toContain("• Cliente: Carlos");
    expect(msg).not.toContain("você");
    expect(msg).toContain("maquete 3D gratuita");
  });

  it("deve gerar link do WhatsApp devidamente codificado com a mensagem de triagem", () => {
    const mensagemTriagem = "Resumo da Triagem:\n- Esporte: Futebol\n- Peças: 20 unidades\n- Nome: João Silva";
    const url = buildWhatsAppUrl(mensagemTriagem);

    expect(url).toContain("https://wa.me/557332639911?text=");
    expect(url).toContain(encodeURIComponent(mensagemTriagem));
  });

  it("deve validar o telefone ao registrar lead via ferramenta da Fabi", async () => {
    const resInv = await executeFabiTool("register_lead", {
      name: "Carlos",
      phone: "123",
    });
    expect(resInv.success).toBe(false);
    expect(resInv.error).toBe("Telefone inválido.");
  });

  it("deve calcular o orçamento de triagem com preço unitário e link de WhatsApp", async () => {
    const calc = await executeFabiTool("calculate_quote", {
      product: "camisa-futebol",
      quantity: 20,
    });

    expect(calc.success).toBe(true);
    expect(calc.quantity).toBe(20);
    expect(calc.finalUnitPrice).toBeGreaterThan(0);
    expect(calc.whatsAppUrl).toContain("https://wa.me/");
  });
});

