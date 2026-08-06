import { calculateEstimate } from "./pricing/calculator";
import { prisma } from "@/lib/db";

export const FABI_TOOLS = [
  {
    type: "function",
    function: {
      name: "calculate_quote",
      description:
        "Calcula o valor unitário e total estimado de um orçamento e gera a URL formatada do WhatsApp com desconto aplicado.",
      parameters: {
        type: "object",
        properties: {
          product: {
            type: "string",
            description:
              "Nome ou identificador do produto (ex: camisa-futebol, camisa-ciclismo, basquete, agasalho, polo)",
          },
          quantity: {
            type: "number",
            description: "Quantidade total de peças solicitadas",
          },
          addOnIds: {
            type: "array",
            items: { type: "string" },
            description:
              "IDs de adicionais como 'manga-longa', 'tecido-poliamida-uv50', 'escudo-bordado'",
          },
        },
        required: ["product", "quantity"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_catalog",
      description:
        "Pesquisa produtos no catálogo da Fase Sport filtrando por termo de busca, categoria ou esporte.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Termo de busca do produto ou modalidade (ex: ciclismo, basquete, regata, agasalho)",
          },
          category: {
            type: "string",
            description: "Slug ou nome da categoria desejada",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_size_chart_by_product",
      description:
        "Busca a tabela de medidas em centímetros para uma categoria ou tipo específico (ex: masculino, feminino, babylook, infantil).",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            description: "Tipo da tabela de medidas (ex: masculino, feminino, babylook, infantil)",
          },
        },
        required: ["type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "register_lead",
      description:
        "Cadastra o contato e interesse do cliente como Lead no banco de dados para envio de maquete 3D pela equipe comercial.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Nome do cliente ou responsável" },
          phone: { type: "string", description: "Telefone / WhatsApp com DDD" },
          sport: { type: "string", description: "Modalidade esportiva informada" },
          quantity: { type: "number", description: "Quantidade estimada de peças" },
          details: { type: "string", description: "Detalhes adicionais do pedido" },
        },
        required: ["phone"],
      },
    },
  },
] as const;

export async function executeFabiTool(
  name: string,
  args: Record<string, any>
): Promise<Record<string, any>> {
  try {
    if (name === "calculate_quote") {
      const product = args.product || "camisa-futebol";
      const quantity = Number(args.quantity) || 10;
      const addOnIds = Array.isArray(args.addOnIds) ? args.addOnIds : [];

      const estimate = calculateEstimate({
        productIdOrName: product,
        quantity,
        addOnIds,
      });

      if (!estimate) {
        return { success: false, error: "Não foi possível calcular o orçamento." };
      }

      return {
        success: true,
        productName: estimate.product.name,
        quantity: estimate.quantity,
        finalUnitPrice: estimate.finalUnitPrice,
        totalPrice: estimate.totalPrice,
        discountPercentage: estimate.discountPercentage,
        whatsAppUrl: estimate.whatsAppUrl,
        summaryText: estimate.summaryText,
      };
    }

    if (name === "search_catalog") {
      const searchTerm = String(args.query || args.category || "").toLowerCase();
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          ...(searchTerm
            ? {
                OR: [
                  { name: { contains: searchTerm, mode: "insensitive" } },
                  { description: { contains: searchTerm, mode: "insensitive" } },
                  { category: { name: { contains: searchTerm, mode: "insensitive" } } },
                ],
              }
            : { isFeatured: true }),
        },
        take: 5,
        select: {
          name: true,
          slug: true,
          description: true,
          fabric: true,
          minQty: true,
          category: { select: { name: true } },
        },
      });

      return {
        success: true,
        count: products.length,
        products: products.map((p) => ({
          name: p.name,
          url: `/produtos/${p.slug}`,
          category: p.category.name,
          fabric: p.fabric || "Dry Fit de Alta Performance",
          minQty: p.minQty,
          description: p.description,
        })),
      };
    }

    if (name === "get_size_chart_by_product") {
      const typeTerm = String(args.type || "").toLowerCase();
      const sizeCharts = await prisma.sizeChart.findMany({
        where: {
          OR: [
            { type: { contains: typeTerm, mode: "insensitive" } },
            { title: { contains: typeTerm, mode: "insensitive" } },
          ],
        },
        take: 2,
      });

      if (sizeCharts.length === 0) {
        const defaultCharts = await prisma.sizeChart.findMany({ take: 2 });
        return {
          success: true,
          charts: defaultCharts,
        };
      }

      return {
        success: true,
        charts: sizeCharts,
      };
    }

    if (name === "register_lead") {
      const phone = String(args.phone || "").replace(/\D/g, "");
      if (phone.length < 10) {
        return { success: false, error: "Telefone inválido." };
      }

      const lead = await prisma.lead.create({
        data: {
          name: args.name || "Cliente Chat Fabi",
          phone,
          sport: args.sport || "Geral",
          quantity: args.quantity ? Number(args.quantity) : null,
          details: args.details || "Cadastrado via Tool Use Chat Fabi",
          source: "chat_fabi_tool",
        },
      });

      return {
        success: true,
        leadId: lead.id,
        message: "Lead registrado com sucesso para a equipe comercial.",
      };
    }

    return { success: false, error: `Ferramenta '${name}' não encontrada.` };
  } catch (error) {
    console.error(`[executeFabiTool] Erro ao executar ${name}:`, error);
    return { success: false, error: "Erro interno ao executar ferramenta." };
  }
}
