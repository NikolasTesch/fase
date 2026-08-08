export interface TriageState {
  detectedSport: string | null;
  detectedProductType: string | null;
  detectedQuantity: number | null;
  customerName: string | null;
  customerPhone: string | null;
}

export function extractTriageState(
  input: string | Array<{ role: string; content: string }>
): TriageState | null {
  if (!input) return null;

  const fullText = typeof input === "string" ? input : input.map((m) => m.content).join(" ");
  if (!fullText.trim()) return null;

  const textLower = fullText.toLowerCase();

  const sportsMap: Record<string, string> = {
    futebol: "Futebol",
    volei: "Vôlei",
    vôlei: "Vôlei",
    basquete: "Basquete",
    ciclismo: "Ciclismo",
    pedal: "Ciclismo",
    bike: "Ciclismo",
    bicicleta: "Ciclismo",
    corrida: "Corrida",
    running: "Corrida",
    maratona: "Corrida",
    empresarial: "Empresarial",
    corporativo: "Empresarial",
    polo: "Empresarial",
    turma: "Turma / Faculdade",
    faculdade: "Turma / Faculdade",
    interclasse: "Turma / Faculdade",
  };

  let detectedSport: string | null = null;
  for (const [k, v] of Object.entries(sportsMap)) {
    if (textLower.includes(k)) {
      detectedSport = v;
      break;
    }
  }

  let detectedProductType: string | null = null;
  if (textLower.includes("kit") || textLower.includes("conjunto") || textLower.includes("farda") || textLower.includes("uniforme completo")) {
    detectedProductType = "Kit Completo (Camisa + Shorts)";
  } else if (textLower.includes("agasalho") || textLower.includes("jaqueta") || textLower.includes("corta-vento") || textLower.includes("moletom")) {
    detectedProductType = "Agasalho / Jaqueta";
  } else if (textLower.includes("polo")) {
    detectedProductType = "Camisa Polo";
  } else if (textLower.includes("colete")) {
    detectedProductType = "Colete Treino";
  } else if (textLower.includes("regata")) {
    detectedProductType = "Regata";
  } else if (textLower.includes("camisa") || textLower.includes("manto") || textLower.includes("camiseta")) {
    detectedProductType = "Camisa Personalizada";
  }

  let detectedQuantity: number | null = null;
  const qtyMatch = fullText.match(/(\d{1,4})\s*(?:peças|pecas|unidades|unidade|conjuntos|conjunto|camisas|camisa|kits|kit|jogos|jogo|pares|par|itens|item|uniformes|uniforme|fardamentos|fardamento)/i);
  if (qtyMatch && qtyMatch[1]) {
    detectedQuantity = parseInt(qtyMatch[1], 10);
  }

  let customerName: string | null = null;
  const nameMatch = fullText.match(/(?:meu nome [eé]|sou o|sou a|me chamo|nome [eé])\s+([A-ZÀ-Úa-zà-ú]{2,15})/i);
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
    detectedProductType,
    detectedQuantity,
    customerName,
    customerPhone,
  };
}

export function buildCleanWhatsAppMessage(
  input: string | Array<{ role: string; content: string }>
): string {
  const state = extractTriageState(input);

  const lines = [
    "Olá equipe Fase Sport! Vim pelo chat do site e gostaria de dar sequência ao meu orçamento:\n",
  ];

  const itemParts: string[] = [];
  if (state?.detectedProductType) {
    itemParts.push(state.detectedProductType);
  }
  if (state?.detectedSport) {
    itemParts.push(`(${state.detectedSport})`);
  }

  if (itemParts.length > 0) {
    lines.push(`• Item: ${itemParts.join(" ")}`);
  }

  if (state?.detectedQuantity) {
    lines.push(`• Quantidade: ${state.detectedQuantity} unidades`);
  }

  if (state?.customerName) {
    lines.push(`• Cliente: ${state.customerName}`);
  }

  lines.push("\nGostaria de solicitar minha maquete 3D gratuita!");

  return lines.join("\n");
}
