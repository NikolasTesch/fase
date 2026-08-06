# Task 16 — ProductCard público: pills de categoria e qtd mínima

**Plano:** `.omo/plans/admin-roles-artes-produtos-grid.md` (todo 16)
**Data:** 2026-08-06
**Resultado:** ✅ PASS

## Alterações

### 1. `src/components/products/ProductCard.tsx`
- Props novas: `categoryName?: string | null` e `minQty?: number | null` (interface `ProductCardProps` + destructuring).
- Linha de pills renderizada abaixo do nome e **antes** do "Sob consulta":
  - Pill categoria: `rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground`.
  - Pill qtd: mesmo estilo, texto `Mín. {minQty} peças`.
  - A linha de pills só é renderizada se houver `categoryName` OU `minQty != null`; pills individuais guardadas com `categoryName ? ... : null` e `minQty != null ? ... : null` — **produto com minQty null não renderiza a pill de qtd e não quebra**.
- Mantidos: badge de tecido na imagem, `data-testid="product-card"`, overlay "Ver Detalhes" com `ArrowRight`, placeholder "Sem imagem", texto "Sob consulta", hrefs inalterados.

### 2. `src/components/products/ProductGrid.tsx`
- `ProductGridItem` estendido com `categoryName?: string | null; minQty?: number | null;`.
- Repassados para `<ProductCard categoryName={product.categoryName} minQty={product.minQty} />`.
- Layout do grid (colunas/gaps) inalterado.

### 3. `src/components/sections/FeaturedSection.tsx`
- `FeaturedProduct` estendido com `categoryName?: string | null; minQty?: number | null;`.
- Repassados para `<ProductCard>` no map do carrossel.

### 4. `src/app/(marketing)/page.tsx`
- Query de featured: adicionado `minQty: true` ao `select` existente (NÃO convertido para `include` — shape do retorno preservado; `category: { select: { slug: true, name: true } }` já existia).
- Tipo do fallback de erro (`featuredProducts: [] as {...}[]`) atualizado com `minQty: number | null` para manter a união compatível.
- Map do `featuredItems` (linhas ~86-93): adicionado `categoryName: product.category.name` e `minQty: product.minQty`.

### 5. `src/app/(marketing)/[categoria]/page.tsx`
- Query do helper `getCategoryData` usa `include` no products (`include: { images: ... }`) → **já expõe todos os escalares**, incluindo `minQty` (confirmado: `minQty Int @default(10)` no schema) — nenhuma mudança de query necessária.
- Map das linhas ~96-106: adicionado `categoryName: category.name` e `minQty: product.minQty`.

### 6. `src/app/(marketing)/busca/page.tsx`
- `include` de category trocado de `category: { select: { slug: true } }` para `category: { select: { slug: true, name: true } }`.
- Map (linhas ~50-57): adicionado `categoryName: p.category.name` e `minQty: p.minQty`.

## Verificação

### `npx tsc --noEmit`

```
TSC_EXIT=0
```

Sem erros de tipo.

### Verificações de guardrails (revisão do diff)

- [x] `data-testid="product-card"` mantido em `ProductCard.tsx`.
- [x] Badge de tecido na imagem mantido (não movido nem removido).
- [x] Overlay "Ver Detalhes" e texto "Sob consulta" intactos.
- [x] Layout do grid (colunas `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` / carrossel `lg:grid-cols-4`) inalterado.
- [x] Hrefs inalterados (`/${categorySlug}/${slug}`).
- [x] Nenhum `"use client"` adicionado onde não havia (ProductCard/ProductGrid continuam server-compatible; FeaturedSection já era client).
- [x] Nenhum outro componente/página tocado além dos 6 listados.
- [x] minQty null → pill de qtd não renderiza (guard `minQty != null`), sem crash.

## QA de aceite (plano)

| Critério | Resultado |
|---|---|
| `npx tsc --noEmit` passa | ✅ exit 0 |
| `data-testid="product-card"` mantido | ✅ |
| Pills aparecem nas 3 superfícies (homepage, categoria, busca) | ✅ props repassadas nas 3 |
| Produto com minQty null não renderiza pill "Mín." | ✅ guard condicional |
