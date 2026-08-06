import {
  BASE_PRODUCT_PRICES,
  PRICING_TIERS,
  PRODUCT_ADDONS,
  COMMERCIAL_POLICIES,
  BaseProductPrice,
} from "./rules";
import { buildWhatsAppUrl } from "@/lib/site";

export interface EstimateOptions {
  productIdOrName: string;
  quantity: number;
  addOnIds?: string[];
}

export interface EstimateResult {
  product: BaseProductPrice;
  quantity: number;
  baseUnitPrice: number;
  discountPercentage: number;
  discountedUnitPrice: number;
  addOnsUnitPrice: number;
  finalUnitPrice: number;
  totalPrice: number;
  whatsAppUrl: string;
  summaryText: string;
}

export function calculateEstimate(options: EstimateOptions): EstimateResult | null {
  const { productIdOrName, quantity, addOnIds = [] } = options;

  if (quantity <= 0) return null;

  const normalizedInput = productIdOrName.toLowerCase();
  const product =
    BASE_PRODUCT_PRICES.find(
      (p) =>
        p.id === normalizedInput ||
        p.name.toLowerCase().includes(normalizedInput) ||
        p.category.toLowerCase().includes(normalizedInput)
    ) || BASE_PRODUCT_PRICES[0];

  const tier =
    PRICING_TIERS.find(
      (t) => quantity >= t.minQty && (t.maxQty === undefined || quantity <= t.maxQty)
    ) || PRICING_TIERS[PRICING_TIERS.length - 1];

  const discountPercentage = tier ? tier.discountPercentage : 0;
  const baseUnitPrice = product.basePrice;
  const discountedUnitPrice = baseUnitPrice * (1 - discountPercentage / 100);

  let addOnsUnitPrice = 0;
  const selectedAddOns = PRODUCT_ADDONS.filter((addon) => addOnIds.includes(addon.id));
  selectedAddOns.forEach((addon) => {
    addOnsUnitPrice += addon.extraPrice;
  });

  const finalUnitPrice = Number((discountedUnitPrice + addOnsUnitPrice).toFixed(2));
  const totalPrice = Number(
    (finalUnitPrice * Math.max(quantity, COMMERCIAL_POLICIES.minOrderQty)).toFixed(2)
  );

  const addOnsText =
    selectedAddOns.length > 0 ? selectedAddOns.map((a) => a.name).join(", ") : "Nenhum";

  const message =
    `Olá Fase Sport! Fiz uma simulação de orçamento no chat:\n\n` +
    `• Item: ${product.name}\n` +
    `• Quantidade: ${quantity} unidades\n` +
    `• Adicionais: ${addOnsText}\n` +
    `• Valor Unitário Estimado: R$ ${finalUnitPrice.toFixed(2).replace(".", ",")}\n` +
    `• Valor Total Estimado: R$ ${totalPrice.toFixed(2).replace(".", ",")}\n\n` +
    `Gostaria de dar sequência ao atendimento e criar meu layout 3D!`;

  const whatsAppUrl = buildWhatsAppUrl(message);

  const summaryText =
    `Orçamento Estimado (${product.name}):\n` +
    `- Quantidade: ${quantity} peças\n` +
    `- Valor Unitário: R$ ${finalUnitPrice.toFixed(2).replace(".", ",")} (Desconto de ${discountPercentage}% aplicado)\n` +
    `- Valor Total: R$ ${totalPrice.toFixed(2).replace(".", ",")}\n` +
    `- Condição: ${COMMERCIAL_POLICIES.paymentTerms}\n` +
    `- Prazo: ${COMMERCIAL_POLICIES.leadTimeDays}`;

  return {
    product,
    quantity,
    baseUnitPrice,
    discountPercentage,
    discountedUnitPrice,
    addOnsUnitPrice,
    finalUnitPrice,
    totalPrice,
    whatsAppUrl,
    summaryText,
  };
}

export function getPricingRulesContext(): string {
  const productsFormatted = BASE_PRODUCT_PRICES.map(
    (p) =>
      `• **${p.name}**: R$ ${p.basePrice.toFixed(2).replace(".", ",")} / un (mínimo de ${p.minQty} peças)`
  ).join("\n");

  const tiersFormatted = PRICING_TIERS.map((t) => {
    if (t.maxQty) {
      return `• De ${t.minQty} a ${t.maxQty} unidades: ${
        t.discountPercentage > 0 ? `${t.discountPercentage}% de desconto` : "Preço base"
      }`;
    }
    return `• A partir de ${t.minQty} unidades: ${t.discountPercentage}% de desconto`;
  }).join("\n");

  const addOnsFormatted = PRODUCT_ADDONS.map(
    (a) => `• **${a.name}**: +R$ ${a.extraPrice.toFixed(2).replace(".", ",")} por peça`
  ).join("\n");

  return (
    "--- TABELA DE PREÇOS E REGRAS COMERCIAIS FASE SPORT ---\n" +
    "Preços base de referência:\n" +
    productsFormatted +
    "\n\nDescontos por quantidade:\n" +
    tiersFormatted +
    "\n\nAdicionais e Opcionais:\n" +
    addOnsFormatted +
    "\n\nPolíticas da Loja:\n" +
    `• Pedido mínimo: ${COMMERCIAL_POLICIES.minOrderQty} peças por lote.\n` +
    `• Pagamento: ${COMMERCIAL_POLICIES.paymentTerms}\n` +
    `• Prazo de Produção: ${COMMERCIAL_POLICIES.leadTimeDays}\n` +
    `• Personalização: ${COMMERCIAL_POLICIES.customizationIncluded}`
  );
}
