import { describe, it, expect } from "vitest";
import { buildFabiSystemPrompt } from "@/lib/rag/prompts";

describe("Fabi RAG Prompts", () => {
  it("deve substituir a tag {{CONTEXT}} com o contexto fornecido", () => {
    const context = "Pedido mínimo: 10 peças.";
    const result = buildFabiSystemPrompt(context);

    expect(result).toContain("Pedido mínimo: 10 peças.");
    expect(result).toContain("Você é a Fabi");
    expect(result).not.toContain("{{CONTEXT}}");
  });

  it("deve fornecer mensagem padrão se o contexto for vazio", () => {
    const result = buildFabiSystemPrompt("");
    expect(result).toContain("Nenhum contexto específico do banco encontrado.");
  });

  it("deve incluir diretrizes de links Markdown e medidas em centímetros", () => {
    const result = buildFabiSystemPrompt("Contexto de teste");
    expect(result).toContain("[Nome do Produto](/produtos/slug)");
    expect(result).toContain("apresente os valores em centímetros");
  });
});

