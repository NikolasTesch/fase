import { FABI_TOOLS } from "./tools";

export interface LLMMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
}

export interface LLMCompletionOptions {
  systemPrompt: string;
  messages: LLMMessage[];
  temperature?: number;
}

export async function fetchLLMStream(
  options: LLMCompletionOptions
): Promise<ReadableStream | null> {
  const provider = (process.env.AI_PROVIDER || "opencode-go").toLowerCase();

  try {
    let apiBaseUrl = "https://api.openai.com/v1";
    let apiKey = "";
    let modelName = "opencode-go/deepseek-v4-flash";
    let extraHeaders: Record<string, string> = {};

    if (provider === "openrouter") {
      apiBaseUrl = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
      apiKey = process.env.OPENROUTER_API_KEY || "";
      modelName = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";
      extraHeaders = {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://fasesport.com.br",
        "X-Title": "Fase Sport Fabi AI",
      };
    } else if (provider === "opencode-go") {
      apiBaseUrl = process.env.OPENCODE_GO_BASE_URL || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
      apiKey =
        process.env.OPENCODE_GO_API_KEY ||
        process.env.OPENAI_API_KEY ||
        process.env.DEEPSEEK_API_KEY ||
        "";
      modelName = process.env.OPENCODE_GO_MODEL || "opencode-go/deepseek-v4-flash";
    } else if (provider === "local") {
      return null;
    }

    if (!apiKey && provider !== "local") {
      return null;
    }

    // 1. Tenta chamada inicial sem stream para verificar se a LLM quer executar Tool Call
    const initialMessages: Array<{ role: string; content: string; tool_calls?: unknown }> = [
      { role: "system", content: options.systemPrompt },
      ...options.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    try {
      const checkRes = await fetch(`${apiBaseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          ...extraHeaders,
        },
        body: JSON.stringify({
          model: modelName,
          messages: initialMessages,
          tools: FABI_TOOLS,
          temperature: options.temperature ?? 0.5,
          stream: false,
        }),
      });

      if (checkRes.ok) {
        const data = await checkRes.json();
        const choiceMsg = data.choices?.[0]?.message;

        if (choiceMsg?.tool_calls && Array.isArray(choiceMsg.tool_calls) && choiceMsg.tool_calls.length > 0) {
          // Executa as ferramentas solicitadas no servidor
          const { executeFabiTool } = await import("./tools");
          initialMessages.push(choiceMsg);

          for (const tc of choiceMsg.tool_calls) {
            if (tc.type === "function" && tc.function) {
              const fnName = tc.function.name;
              let parsedArgs = {};
              try {
                parsedArgs = JSON.parse(tc.function.arguments || "{}");
              } catch {
                parsedArgs = {};
              }

              const result = await executeFabiTool(fnName, parsedArgs);
              initialMessages.push({
                role: "tool",
                content: JSON.stringify(result),
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn("[fetchLLMStream] Falha no teste inicial de tool calling. Prosseguindo com stream direto:", err);
    }

    // 2. Transmite a resposta final com as ferramentas já resolvidas
    const response = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...extraHeaders,
      },
      body: JSON.stringify({
        model: modelName,
        messages: initialMessages,
        tools: FABI_TOOLS,
        temperature: options.temperature ?? 0.5,
        stream: true,
      }),
    });

    if (response.ok && response.body) {
      return response.body;
    }

    console.warn(`[fetchLLMStream] Provedor ${provider} retornou HTTP ${response.status}. Ativando fallback RAG Local.`);
    return null;
  } catch (error) {
    console.error(`[fetchLLMStream] Erro de conexão com provedor ${provider}:`, error);
    return null;
  }
}
