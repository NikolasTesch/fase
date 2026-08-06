import { ProductCard } from "@/components/products/ProductCard";

interface ProductGridItem {
  slug: string;
  name: string;
  categorySlug: string;
  categoryName?: string | null;
  minQty?: number | null;
  fabric?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
}

interface ProductGridProps {
  products: ProductGridItem[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
        <p className="text-base font-medium text-foreground">
          Nenhum produto encontrado
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Ainda não há modelos nesta seleção. Fale com a gente para um pedido sob
          medida.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.slug}
          slug={product.slug}
          name={product.name}
          categorySlug={product.categorySlug}
          categoryName={product.categoryName}
          minQty={product.minQty}
          fabric={product.fabric}
          imageUrl={product.imageUrl}
          imageAlt={product.imageAlt}
        />
      ))}
    </div>
  );
}
