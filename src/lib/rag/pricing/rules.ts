import futebolData from "./tables/futebol.json";
import ciclismoData from "./tables/ciclismo.json";
import runningData from "./tables/running.json";
import basqueteData from "./tables/basquete.json";
import agasalhoData from "./tables/agasalho.json";
import empresarialData from "./tables/empresarial.json";
import tiersData from "./tables/tiers.json";
import addonsData from "./tables/addons.json";
import policiesData from "./tables/policies.json";

export interface PriceTier {
  minQty: number;
  maxQty?: number;
  discountPercentage: number;
}

export interface BaseProductPrice {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  minQty: number;
  description: string;
}

export interface ProductAddOn {
  id: string;
  name: string;
  extraPrice: number;
}

interface CategoryFileFormat {
  category: string;
  products: Array<{
    id: string;
    name: string;
    basePrice: number;
    minQty: number;
    description: string;
  }>;
}

const categoryFiles: CategoryFileFormat[] = [
  futebolData,
  ciclismoData,
  runningData,
  basqueteData,
  agasalhoData,
  empresarialData,
];

export const BASE_PRODUCT_PRICES: BaseProductPrice[] = categoryFiles.flatMap((cat) =>
  cat.products.map((p) => ({
    id: p.id,
    name: p.name,
    category: cat.category,
    basePrice: p.basePrice,
    minQty: p.minQty,
    description: p.description,
  }))
);

export const PRICING_TIERS: PriceTier[] = tiersData as PriceTier[];

export const PRODUCT_ADDONS: ProductAddOn[] = addonsData as ProductAddOn[];

export const COMMERCIAL_POLICIES = policiesData;
