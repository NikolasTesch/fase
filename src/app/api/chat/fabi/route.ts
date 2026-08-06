import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/ip";
import { ratelimit } from "@/lib/ratelimit";
import { getFabiContext } from "@/lib/rag/fabi";
import { buildFabiSystemPrompt } from "@/lib/rag/prompts";
import { FABI_TOOLS, executeFabiTool } from "@/lib/rag/tools";
import { fetchLLMStream } from "@/lib/rag/provider";

const MessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string().min(1).max(2000),
});

const ChatBodySchema = z.object({
  sessionId: z.string().optional(),
  messages: z.array(MessageSchema).min(1).max(30),
});

const FeedbackSchema = z.object({
  messageId: z.string(),
  feedback: z.number().int().min(-1).max(1),
});

export async function PATCH(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = FeedbackSchema.safeParse(json);
    if (!parsed.success) {
      return Response.json({ success: false, message: "Payload inválido." }, { status: 400 });
    }

    await prisma.chatMessage.update({
      where: { id: parsed.data.messageId },
      data: { feedback: parsed.data.feedback },
    });

    return Response.json({ success: true, message: "Feedback registrado." });
  } catch (error) {
    console.error("[PATCH /api/chat/fabi]", error);
    return Response.json({ success: false, message: "Erro ao registrar feedback." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || undefined;
    const { success } = await ratelimit.limit(`fabi-chat-${ip}`);

    if (!success) {
      return Response.json(
        { success: false, message: "Muitas mensagens enviadas. Aguarde um instante." },
        { status: 429 }
      );
    }

    const json = await req.json();
    const parsed = ChatBodySchema.safeParse(json);

    if (!parsed.success) {
      return Response.json(
        { success: false, message: "Formato de mensagem inválido." },
        { status: 400 }
      );
    }

    const { messages } = parsed.data;
    let sessionId = parsed.data.sessionId;

    // Garante que existe uma ChatSession no banco para rastrear analytics
    if (!sessionId) {
      const session = await prisma.chatSession.create({
        data: { userIp: ip, userAgent, status: "ACTIVE" },
      });
      sessionId = session.id;
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";

    if (lastUserMessage) {
      await prisma.chatMessage.create({
        data: {
          sessionId,
          role: "user",
          content: lastUserMessage,
        },
      });
    }

    // 1. Busca contexto RAG baseado no histórico relevante da conversa
    const ragResult = await getFabiContext(messages);
    const systemPrompt = buildFabiSystemPrompt(ragResult.contextText);

    // 2. Tenta capturar Lead se a mensagem contiver dados de contato explícitos
    await attemptAutoLeadCapture(lastUserMessage, messages, sessionId);

    // 3. Executa chamada LLM via Provedor configurado (OpenCode Go, OpenRouter ou Local)
    const llmStream = await fetchLLMStream({
      systemPrompt,
      messages,
    });

    if (llmStream) {
      return new Response(llmStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // 4. Fallback / Motor Inteligente RAG Local (caso sem chave LLM externa configurada)
    const stream = await createLocalFabiStream(lastUserMessage, ragResult.contextText);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[POST /api/chat/fabi]", error);
    return Response.json(
      { success: false, message: "Erro ao processar conversa com a Fabi." },
      { status: 500 }
    );
  }
}

/**
 * Tenta identificar número de telefone na mensagem para cadastrar Lead de forma proativa.
 */
async function attemptAutoLeadCapture(
  userMsg: string,
  history: Array<{ role: string; content: string }>,
  sessionId?: string
) {
  try {
    const phoneRegex = /(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{4})/;
    const match = userMsg.match(phoneRegex);

    if (match) {
      const extractedPhone = match[0].replace(/\D/g, "");
      if (extractedPhone.length >= 10) {
        // Evita cadastrar lead duplicado do mesmo telefone se foi criado nos últimos 30 minutos
        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
        const existingRecentLead = await prisma.lead.findFirst({
          where: {
            phone: extractedPhone,
            createdAt: { gte: thirtyMinsAgo },
          },
        });

        if (existingRecentLead) {
          if (sessionId && !existingRecentLead.id) {
            await prisma.chatSession.update({
              where: { id: sessionId },
              data: { leadId: existingRecentLead.id },
            });
          }
          return;
        }

        const fullConversation = history.map((m) => m.content).join(" ");
        const convLower = fullConversation.toLowerCase();

        // Tenta inferir o esporte mencionado
        let detectedSport = "Geral";
        const sportsMap: Record<string, string> = {
          futebol: "Futebol",
          volei: "Vôlei",
          vôlei: "Vôlei",
          basquete: "Basquete",
          handebol: "Handebol",
          corrida: "Corrida/Running",
          running: "Corrida/Running",
          ciclismo: "Ciclismo",
          pedal: "Ciclismo",
          empresarial: "Empresarial",
        };

        for (const [key, val] of Object.entries(sportsMap)) {
          if (convLower.includes(key)) {
            detectedSport = val;
            break;
          }
        }

        // Tenta inferir nome do cliente ("meu nome é X", "sou o X", "chamo X")
        let name = "Cliente Chat Fabi";
        const nameMatch = fullConversation.match(/(?:meu nome [eé]|sou o|sou a|me chamo)\s+([A-ZÀ-Úa-zà-ú]{2,15})/i);
        if (nameMatch && nameMatch[1]) {
          const cap = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
          name = `${cap} (Chat Fabi)`;
        }

        // Tenta inferir quantidade mencionada
        let quantity: number | null = null;
        const qtyMatch = fullConversation.match(/(\d{1,4})\s*(?:peças|pecas|unidades|conjuntos|camisas)/i);
        if (qtyMatch && qtyMatch[1]) {
          const parsedQty = parseInt(qtyMatch[1], 10);
          if (!isNaN(parsedQty) && parsedQty > 0) {
            quantity = parsedQty;
          }
        }

        const newLead = await prisma.lead.create({
          data: {
            name,
            phone: extractedPhone,
            sport: detectedSport,
            quantity,
            details: `Capturado via Chat Fabi RAG. Trecho recente: ${fullConversation.slice(-300)}`,
            source: "chat_fabi",
          },
        });

        if (sessionId) {
          await prisma.chatSession.update({
            where: { id: sessionId },
            data: { leadId: newLead.id },
          });
        }
      }
    }
  } catch (err) {
    console.error("[attemptAutoLeadCapture]", err);
  }
}

/**
 * Motor de resposta inteligente baseado no RAG quando executado em ambiente local/sem chave externa.
 * Transmite tokens simulando SSE em tempo real.
 */
async function createLocalFabiStream(query: string, context: string): Promise<ReadableStream> {
  const encoder = new TextEncoder();
  const lower = query.toLowerCase();

  let answer = "";

  // Tenta identificar quantidade informada para simular orçamento automático no local stream
  const qtyMatch = lower.match(/(\d{1,4})\s*(?:peças|pecas|unidades|conjuntos|camisas|pecas)/);
  const detectedQty = qtyMatch ? parseInt(qtyMatch[1], 10) : 0;

  if (detectedQty > 0 || lower.includes("orcamento") || lower.includes("orçamento") || lower.includes("quanto custa") || lower.includes("preço")) {
    const qty = detectedQty >= 10 ? detectedQty : 10;
    const calc = await executeFabiTool("calculate_quote", {
      product: lower.includes("ciclismo") ? "camisa-ciclismo" : lower.includes("basquete") ? "basquete" : "camisa-futebol",
      quantity: qty,
    });

    if (calc.success) {
      answer =
        `Com certeza! Fiz uma simulação de orçamento para **${calc.quantity} unidades** de **${calc.productName}**:\n\n` +
        `• **Valor Unitário**: R$ ${calc.finalUnitPrice.toFixed(2).replace(".", ",")} (com ${calc.discountPercentage}% de desconto)\n` +
        `• **Valor Total Estimado**: R$ ${calc.totalPrice.toFixed(2).replace(".", ",")}\n\n` +
        `Lembrando que o pedido mínimo é de **10 peças por modelo** e a personalização (nomes, números e patrocinadores) já está toda inclusa sem taxa extra!\n\n` +
        `Gostaria de criar o seu layout 3D personalizado com nosso time?`;
    } else {
      answer =
        "Nosso **pedido mínimo é de 10 unidades** por modelo/lote!\n\n" +
        "Quanto maior a quantidade do seu pedido, maior o desconto unitário aplicado. Para receber uma simulação completa do seu time com artes 3D, pode nos chamar diretamente no WhatsApp!";
    }
  } else if (lower.includes("minimo") || lower.includes("mínimo") || lower.includes("quantidade")) {
    answer =
      "Na **Fase Sport**, nosso **pedido mínimo é de apenas 10 unidades** por modelo/lote!\n\n" +
      "Você pode personalizar tamanhos variados do Infantil ao XG e adicionar nomes/números individuais para cada atleta da sua equipe sem custo adicional de impressão.";
  } else if (lower.includes("tamanho") || lower.includes("tabela") || lower.includes("medida") || lower.includes("babylook") || lower.includes("infantil")) {
    answer =
      "Trabalhamos com tabelas de medidas completas em centímetros do **Infantil ao XG**, além das opções **Feminino Babylook** e **Masculino Tradicional**.\n\n" +
      "Nossos moldes possuem corte anatômico de alta mobilidade esportiva. Você pode conferir os tamanhos detalhados na página dos produtos no nosso site ou solicitar a tabela direto no WhatsApp!";
  } else if (lower.includes("tecido") || lower.includes("pano") || lower.includes("qualidade") || lower.includes("uv")) {
    answer =
      "Utilizamos tecidos tecnológicos com tecnologia **Dry Fit de alta absorção**, proteção UV e tratamento antissuor.\n\n" +
      "As impressões são feitas por **sublimação total computadorizada de alta definição**, o que garante que as cores nunca desbotem e as estampas fiquem perfeitas por anos!";
  } else if (lower.includes("prazo") || lower.includes("entrega") || lower.includes("demora")) {
    answer =
      "Nosso prazo médio de produção após a aprovação da arte 3D é super rápido! Enviamos com segurança para todo o Brasil via transportadora ou Correios.\n\n" +
      "Se você tiver uma data de torneio ou evento específico próximo, avise a nossa equipe no WhatsApp que ajustamos o cronograma de entrega!";
  } else {
    answer =
      `Olá! Eu sou a **Fabi**, assistente da **Fase Sport**.\n\n` +
      `Confeccionamos uniformes esportivos 100% personalizados por sublimação para futebol, ciclismo, basquete, corrida, turmas e empresas.\n\n` +
      `Nosso **pedido mínimo é de 10 unidades**. Como posso te ajudar hoje? Fique à vontade para me perguntar sobre modelos, prazos, tecidos ou orçamentos!`;
  }

  // Adiciona badge de fonte RAG se encontrou produtos no catálogo
  if (context.includes("PRODUTOS ENCONTRADOS")) {
    answer += "\n\n Encontrei ótimas opções no nosso catálogo que combinam com sua busca!";
  }

  return new ReadableStream({
    async start(controller) {
      const words = answer.split(" ");
      for (const word of words) {
        const payload = JSON.stringify({
          choices: [{ delta: { content: word + " " } }],
        });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        await new Promise((r) => setTimeout(r, 40));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}
