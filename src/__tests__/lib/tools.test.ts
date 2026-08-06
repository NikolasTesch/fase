import { describe, it, expect } from "vitest";
import { executeFabiTool, FABI_TOOLS } from "@/lib/rag/tools";
import { getFabiContext } from "@/lib/rag/fabi";

describe("Módulo de Ferramentas RAG (Function Calling & Multi-turn)", () => {
  it("deve definir ferramentas Válidas no schema FABI_TOOLS", () => {
    expect(FABI_TOOLS.length).toBeGreaterThanOrEqual(2);
    const names = FABI_TOOLS.map((t) => t.function.name);
    expect(names).toContain("calculate_quote");
    expect(names).toContain("register_lead");
  });

  it("deve executar a ferramenta calculate_quote corretamente", async () => {
    const res = await executeFabiTool("calculate_quote", {
      product: "camisa-futebol",
      quantity: 20,
      addOnIds: ["manga-longa"],
    });

    expect(res.success).toBe(true);
    expect(res.productName).toContain("Futebol");
    expect(res.quantity).toBe(20);
    expect(res.whatsAppUrl).toBeDefined();
  });

  it("deve retornar erro ao cadastrar lead sem telefone válido", async () => {
    const res = await executeFabiTool("register_lead", {
      name: "João",
      phone: "123",
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe("Telefone inválido.");
  });

  it("deve recuperar contexto RAG utilizando histórico de mensagens multi-turn", async () => {
    const history = [
      { role: "user", content: "Preciso de uniformes de basquete para um torneio." },
      { role: "assistant", content: "Temos ótimas regatas e conjuntos de basquete!" },
      { role: "user", content: "Quanto custa 15 unidades?" },
    ];

    const context = await getFabiContext(history);

    expect(context).toBeDefined();
    expect(context.contextText).toBeDefined();
    expect(context.contextText.length).toBeGreaterThan(0);
  });
});
