import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { getPricingRulesContext } from "@/lib/rag/pricing/calculator";
import { COMMERCIAL_POLICIES } from "@/lib/rag/pricing/rules";

export interface RAGQueryResult {
  contextText: string;
  sourceCount: number;
  hasProducts: boolean;
  hasFaqs: boolean;
  hasSizeChart: boolean;
}

interface SizeChartRowData {
  label: string;
  values: string[];
}

interface CatalogSnapshot {
  faqs: Array<{ question: string; answer: string; sortOrder: number }>;
  products: Array<{
    name: string;
    slug: string;
    description: string | null;
    fabric: string | null;
    minQty: number;
    isFeatured: boolean;
    category: { name: string; slug: string };
  }>;
  modalities: Array<{ name: string; description: string | null; sectionTitle: string }>;
  sizeCharts: Array<{ type: string; title: string; columns: unknown; rows: unknown }>;
}

const SYNONYMS: Record<string, string[]> = {
  manto: ["camisa", "uniforme", "futebol"],
  mantos: ["camisa", "uniforme", "futebol"],
  farda: ["uniforme", "camisa"],
  fardamento: ["uniforme", "camisa"],
  kit: ["conjunto", "uniforme"],
  kits: ["conjunto", "uniforme"],
  camiseta: ["camisa"],
  camisetas: ["camisa"],
  regata: ["basquete", "corrida", "camisa"],
  regatas: ["basquete", "corrida", "camisa"],
  pedal: ["ciclismo"],
  bike: ["ciclismo"],
  bicicleta: ["ciclismo"],
  manguito: ["ciclismo", "acessorio"],
  running: ["corrida"],
  maratona: ["corrida"],
  treino: ["corrida", "futebol"],
  orcamento: ["orcamento", "preco", "valor"],
  orçamento: ["orcamento", "preco", "valor"],
  preco: ["preco", "orcamento", "valor"],
  preço: ["preco", "orcamento", "valor"],
  valor: ["valor", "preco", "orcamento"],
  quanto: ["preco", "orcamento"],
  custo: ["preco", "orcamento"],
  corta: ["agasalho", "jaqueta", "corta-vento"],
  jaqueta: ["agasalho"],
  moletom: ["agasalho"],
  babylook: ["tamanho", "feminino", "medida"],
  infantil: ["tamanho", "medida"],
  empresarial: ["empresa", "corporativo", "polo"],
  turma: ["faculdade", "interclasse", "conjunto"],
};

/**
 * Normaliza e extrai palavras-chave relevantes com expansão de sinônimos.
 */
function extractKeywords(query: string): string[] {
  const normalized = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");

  const stopWords = new Set([
    "qual", "quais", "como", "onde", "quanto", "quem", "porque", "para", "com",
    "sem", "por", "que", "tem", "voce", "voces", "fase", "fabi", "uma", "um",
    "uns", "umas", "dos", "das", "seu", "sua", "meu", "minha", "fazer", "quero",
    "gostaria", "saber", "obter", "poderia", "me", "nos", "dar", "sobre"
  ]);

  const rawWords = normalized
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const expanded = new Set<string>();
  for (const word of rawWords) {
    expanded.add(word);
    const syns = SYNONYMS[word];
    if (syns) {
      syns.forEach((s) => expanded.add(s));
    }
  }

  return Array.from(expanded);
}

/**
 * Expande e sintetiza a intenção comercial do usuário com base no histórico recente (HyDE / Query Expansion).
 */
export function expandQueryWithIntent(
  input: string | Array<{ role: string; content: string }>
): { combinedQuery: string; detectedIntent: string } {
  if (typeof input === "string") {
    return { combinedQuery: input, detectedIntent: input };
  }

  if (!Array.isArray(input) || input.length === 0) {
    return { combinedQuery: "", detectedIntent: "" };
  }

  const userMessages = input.filter((m) => m.role === "user").map((m) => m.content);
  const lastMessage = userMessages[userMessages.length - 1] || "";
  const recentHistory = userMessages.slice(-3).join(" ").toLowerCase();

  const sports = ["futebol", "ciclismo", "basquete", "corrida", "running", "volei", "vôlei", "agasalho", "polo", "empresarial", "turma"];
  const detectedSport = sports.find((s) => recentHistory.includes(s)) || "";

  const qtyMatch = recentHistory.match(/(\d{1,4})\s*(?:peças|pecas|unidades|conjuntos|camisas)/);
  const detectedQty = qtyMatch ? `${qtyMatch[1]} unidades` : "";

  const enrichedParts = [lastMessage];
  if (detectedSport && !lastMessage.toLowerCase().includes(detectedSport)) {
    enrichedParts.push(detectedSport);
  }
  if (detectedQty && !lastMessage.toLowerCase().includes(detectedQty)) {
    enrichedParts.push(detectedQty);
  }

  const combinedQuery = enrichedParts.join(" ");
  return { combinedQuery, detectedIntent: `${detectedSport} ${detectedQty}`.trim() };
}

/**
 * Carrega o catálogo (FAQs, produtos, modalidades, medidas) para o contexto RAG.
 * Cacheado por 5 minutos — o catálogo muda raramente e cada mensagem do chat
 * dispararia uma varredura completa no banco.
 */
async function loadCatalog(): Promise<CatalogSnapshot> {
  const [faqs, products, modalities, sizeCharts] = await Promise.all([
    prisma.faq.findMany({
      where: { isActive: true },
      select: { question: true, answer: true, sortOrder: true },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: {
        name: true,
        slug: true,
        description: true,
        fabric: true,
        minQty: true,
        isFeatured: true,
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.modalityItem.findMany({
      where: { isActive: true },
      select: { name: true, description: true, sectionTitle: true },
    }),
    prisma.sizeChart.findMany({
      select: { type: true, title: true, columns: true, rows: true },
    }),
  ]);

  return { faqs, products, modalities, sizeCharts };
}

const cachedCatalog = unstable_cache(loadCatalog, ["fabi-catalog"], {
  revalidate: 300,
  tags: ["fabi-catalog"],
});

async function getCatalog(): Promise<CatalogSnapshot> {
  try {
    return await cachedCatalog();
  } catch {
    return await loadCatalog();
  }
}

const normalizeForMatch = (value: string) =>
  value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/**
 * Busca dinâmica de contexto relevante no catálogo (cacheado) e tabelas de
 * precificação para enriquecer o prompt da Fabi. Suporta busca por mensagem
 * individual (string) ou por histórico completo de conversa (multi-turn).
 */
export async function getFabiContext(
  input: string | Array<{ role: string; content: string }>
): Promise<RAGQueryResult> {
  const { combinedQuery } = expandQueryWithIntent(input);
  const keywords = extractKeywords(combinedQuery);
  const contextParts: string[] = [];

  let sourceCount = 0;
  let hasProducts = false;
  let hasFaqs = false;
  let hasSizeChart = false;

  try {
    const catalog = await getCatalog();

    // 1. FAQs relacionadas com pontuação por correspondência
    if (keywords.length > 0) {
      const scoredFaqs = catalog.faqs
        .map((f) => {
          let score = 0;
          const qNorm = normalizeForMatch(f.question);
          const aNorm = normalizeForMatch(f.answer);

          for (const kw of keywords) {
            if (qNorm.includes(kw)) score += 3;
            if (aNorm.includes(kw)) score += 1;
          }
          return { faq: f, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);

      if (scoredFaqs.length > 0) {
        hasFaqs = true;
        sourceCount += scoredFaqs.length;
        contextParts.push(
          "--- PERGUNTAS FREQUENTES RELACIONADAS ---\n" +
            scoredFaqs.map((item) => `P: ${item.faq.question}\nR: ${item.faq.answer}`).join("\n\n")
        );
      }
    }

    // Fallback/Top FAQs se não encontrou específicas por keyword
    if (!hasFaqs) {
      const defaultFaqs = [...catalog.faqs]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .slice(0, 3);
      if (defaultFaqs.length > 0) {
        contextParts.push(
          "--- DÚVIDAS MAIS COMUNS DA LOJA ---\n" +
            defaultFaqs.map((f) => `P: ${f.question}\nR: ${f.answer}`).join("\n\n")
        );
      }
    }

    // 2. Produtos & Categorias com busca pontuada e ordenação por relevância
    const scoredProducts = catalog.products
      .map((p) => {
        let score = 0;
        const nameNorm = normalizeForMatch(p.name);
        const descNorm = normalizeForMatch(p.description || "");
        const catNorm = normalizeForMatch(p.category.name);
        const fabricNorm = normalizeForMatch(p.fabric || "");

        for (const kw of keywords) {
          if (nameNorm.includes(kw)) score += 5;
          if (catNorm.includes(kw)) score += 3;
          if (fabricNorm.includes(kw)) score += 2;
          if (descNorm.includes(kw)) score += 1;
        }

        if (p.isFeatured && score > 0) score += 1;
        return { product: p, score };
      })
      .filter((item) => (keywords.length > 0 ? item.score > 0 : item.product.isFeatured))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    if (scoredProducts.length > 0) {
      hasProducts = true;
      sourceCount += scoredProducts.length;
      contextParts.push(
        "--- PRODUTOS ENCONTRADOS NO CATÁLOGO ---\n" +
          scoredProducts
            .map(
              (item) =>
                `• **[${item.product.name}](/${item.product.category.slug}/${item.product.slug})** (Categoria: ${item.product.category.name})\n` +
                `  - Link no site: /${item.product.category.slug}/${item.product.slug}\n` +
                `  - Tecido: ${item.product.fabric || "Sublimação Dry Fit de alta performance"}\n` +
                `  - Pedido Mínimo: ${item.product.minQty} unidades\n` +
                `  - Descrição: ${item.product.description || "Uniforme esportivo personalizável."}`
            )
            .join("\n\n")
      );
    }

    // 3. Modalidades esportivas (filtro em memória sobre o snapshot cacheado)
    const modalities = keywords.length > 0
      ? catalog.modalities
          .filter((m) =>
            keywords.some(
              (kw) =>
                normalizeForMatch(m.name).includes(kw) ||
                normalizeForMatch(m.description || "").includes(kw) ||
                normalizeForMatch(m.sectionTitle).includes(kw)
            )
          )
          .slice(0, 3)
      : catalog.modalities.slice(0, 3);

    if (modalities.length > 0) {
      sourceCount += modalities.length;
      contextParts.push(
        "--- MODALIDADES ESPORTIVAS ATENDIDAS ---\n" +
          modalities
            .map((m) => `• **${m.name}** (${m.sectionTitle}): ${m.description || "Uniformes dedicados."}`)
            .join("\n")
      );
    }

    // 4. Tabelas de medidas (se perguntado sobre tamanho, medidas, babylook, etc.)
    const sizeQueryTerms = [
      "tamanho", "tamanhos", "medida", "medidas", "dimensao", "dimensoes",
      "tabela", "veste", "largura", "comprimento", "altura", "peso", "babylook", "infantil"
    ];
    const isAskingSize = keywords.some((kw) => sizeQueryTerms.includes(kw));

    if (isAskingSize) {
      const sizeCharts = catalog.sizeCharts.slice(0, 4);
      if (sizeCharts.length > 0) {
        hasSizeChart = true;
        sourceCount += sizeCharts.length;

        const formattedCharts = sizeCharts.map((sc) => {
          const cols = Array.isArray(sc.columns) ? (sc.columns as unknown as string[]) : [];
          const rows = Array.isArray(sc.rows) ? (sc.rows as unknown as SizeChartRowData[]) : [];

          let chartStr = `• **${sc.title}** (${sc.type}):\n`;
          if (rows.length > 0) {
            chartStr += rows
              .map((r) => {
                const metricDetails = Array.isArray(r.values)
                  ? r.values.map((v, i) => `${cols[i] || `Medida ${i + 1}`}: ${v}cm`).join(" | ")
                  : "";
                return `  - Tamanho ${r.label}: ${metricDetails}`;
              })
              .join("\n");
          } else {
            chartStr += "  - Tabela disponível na página do produto.";
          }
          return chartStr;
        });

        contextParts.push(
          "--- TABELAS DE MEDIDAS DETALHADAS (em centímetros) ---\n" +
            formattedCharts.join("\n\n") +
            "\nApresente essas medidas em centímetros quando o cliente perguntar o tamanho exato ou como medir."
        );
      }
    }

    // 5. Tabela de Preços e Precificação Comercial
    const priceTerms = ["orcamento", "preco", "valor", "quanto", "custo", "desconto", "tabela", "custa"];
    const isAskingPrice = keywords.some((kw) => priceTerms.includes(kw));

    if (isAskingPrice) {
      sourceCount += 1;
      contextParts.push(getPricingRulesContext());
    }

    // 6. Configurações e Regras de Negócio (fonte única: policies.json)
    contextParts.push(
      "--- REGRAS DE NEGÓCIO E CONTATO FASE SPORT ---\n" +
        `• Pedido mínimo: ${COMMERCIAL_POLICIES.minOrderQty} peças por modelo/lote.\n` +
        "• Processo: 1) Seleção do modelo/esporte, 2) Criação do layout 3D personalizado, 3) Aprovação e produção por sublimação total.\n" +
        "• Personalização inclusa: Nomes, números, escudos e patrocinadores sem custo extra de impressão.\n" +
        "• Entrega: Enviamos para todo o Brasil via transportadora e Correios.\n" +
        "• Botão de Orçamento / WhatsApp: Disponível no site para falar direto com a equipe de vendas."
    );

    // 7. Estado da Triagem da Sessão (Multi-Turn Memory)
    const triageState = extractTriageState(input);
    if (
      triageState &&
      (triageState.detectedSport ||
        triageState.detectedQuantity ||
        triageState.customerName ||
        triageState.customerPhone)
    ) {
      contextParts.unshift(
        "--- ESTADO DA TRIAGEM DA SESSÃO ATUAL ---\n" +
          `• Esporte Informado: ${triageState.detectedSport || "Ainda não informado"}\n` +
          `• Quantidade Cotada: ${triageState.detectedQuantity ? `${triageState.detectedQuantity} unidades` : "Ainda não informada"}\n` +
          `• Nome do Cliente: ${triageState.customerName || "Ainda não informado"}\n` +
          `• Telefone/WhatsApp: ${triageState.customerPhone || "Ainda não informado"}\n` +
          "Lembrete: Mantenha esses dados na memória da conversa e não pergunte novamente o que o cliente já informou!"
      );
    }

    return {
      contextText: contextParts.join("\n\n"),
      sourceCount,
      hasProducts,
      hasFaqs,
      hasSizeChart,
    };
  } catch (error) {
    console.error("[getFabiContext] Erro ao buscar contexto no banco:", error);
    let fallbackText =
      "--- INFORMAÇÕES PADRÃO FASE SPORT ---\n" +
      "• Pedido mínimo: 10 unidades.\n" +
      "• Fabricação própria por sublimação total de alta durabilidade.\n" +
      "• WhatsApp para orçamentos disponível no botão da tela.";

    const triageState = extractTriageState(input);
    if (
      triageState &&
      (triageState.detectedSport ||
        triageState.detectedQuantity ||
        triageState.customerName ||
        triageState.customerPhone)
    ) {
      fallbackText =
        "--- ESTADO DA TRIAGEM DA SESSÃO ATUAL ---\n" +
        `• Esporte Informado: ${triageState.detectedSport || "Ainda não informado"}\n` +
        `• Quantidade Cotada: ${triageState.detectedQuantity ? `${triageState.detectedQuantity} unidades` : "Ainda não informada"}\n` +
        `• Nome do Cliente: ${triageState.customerName || "Ainda não informado"}\n` +
        `• Telefone/WhatsApp: ${triageState.customerPhone || "Ainda não informado"}\n` +
        "Lembrete: Mantenha esses dados na memória da conversa e não pergunte novamente o que o cliente já informou!\n\n" +
        fallbackText;
    }

    return {
      contextText: fallbackText,
      sourceCount: 0,
      hasProducts: false,
      hasFaqs: false,
      hasSizeChart: false,
    };
  }
}

/**
 * Extrai o estado atual da triagem da sessão a partir do histórico de conversa.
 */
export function extractTriageState(input: string | Array<{ role: string; content: string }>) {
  if (typeof input === "string" || !Array.isArray(input) || input.length === 0) {
    return null;
  }

  const fullText = input.map((m) => m.content).join(" ");
  const textLower = fullText.toLowerCase();

  const sportsMap: Record<string, string> = {
    futebol: "Futebol",
    volei: "Vôlei",
    vôlei: "Vôlei",
    basquete: "Basquete",
    ciclismo: "Ciclismo",
    pedal: "Ciclismo",
    corrida: "Corrida / Running",
    running: "Corrida / Running",
    empresarial: "Empresarial",
    polo: "Empresarial (Polo)",
  };

  let detectedSport: string | null = null;
  for (const [k, v] of Object.entries(sportsMap)) {
    if (textLower.includes(k)) {
      detectedSport = v;
      break;
    }
  }

  let detectedQuantity: number | null = null;
  const qtyMatch = fullText.match(/(\d{1,4})\s*(?:peças|pecas|unidades|conjuntos|camisas)/i);
  if (qtyMatch && qtyMatch[1]) {
    detectedQuantity = parseInt(qtyMatch[1], 10);
  }

  let customerName: string | null = null;
  const nameMatch = fullText.match(/(?:meu nome [eé]|sou o|sou a|me chamo)\s+([A-ZÀ-Úa-zà-ú]{2,15})/i);
  if (nameMatch && nameMatch[1]) {
    customerName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
  }

  let customerPhone: string | null = null;
  const phoneMatch = fullText.match(/(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{4})/);
  if (phoneMatch) {
    customerPhone = phoneMatch[0].replace(/\D/g, "");
  }

  return {
    detectedSport,
    detectedQuantity,
    customerName,
    customerPhone,
  };
}
