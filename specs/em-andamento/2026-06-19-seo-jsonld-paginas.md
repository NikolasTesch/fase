# SEO — JSON-LD BreadcrumbList + Product offers/brand + FAQ por Categoria

> **Status:** `pendente`
> **ID:** `2026-06-19-seo-jsonld-paginas`
> **Criada em:** 2026-06-12
> **Revisada em:** 2026-06-13
> **Agente:** arquiteto

---

## Contexto

Três gaps de SEO estruturado identificados na revisão de código:

1. **`BreadcrumbList` ausente** em categoria e produto — breadcrumb visual existe mas sem schema.org; Google não o indexa como rich result.

2. **`Product` schema incompleto** em `produto/page.tsx`: falta `offers` e `brand`. Sem `offers`, o produto não é elegível para rich results de produto no Google.

3. **FAQ por categoria ausente** (gap M2). `FaqAccordion` component já existe. `Category` já tem relação `faqs Faq[]` confirmada no schema Prisma (`schema.prisma:24`). Não requer migration — apenas query e renderização.

**Importante:** schema.org exige que structured data corresponda a conteúdo visível na página. Esta spec adiciona tanto a UI do accordion quanto o JSON-LD correspondente para FAQs de categoria.

## Objetivos

- [ ] Adicionar `BreadcrumbList` JSON-LD nas páginas de categoria e produto
- [ ] Completar schema `Product` com `offers` e `brand`
- [ ] Buscar FAQs da categoria e renderizar `<FaqAccordion>` visualmente na página de categoria
- [ ] Adicionar `FAQPage` JSON-LD na categoria quando há FAQs (correspondendo ao accordion visível)

## Fora de escopo

- OG images dinâmicas por rota (pós-launch)
- Schema `Organization` adicional (já existe via `LocalBusiness` na home)
- Reescrita do componente `<Breadcrumb>` visual
- FAQs globais na página de produto (já cobertos em `como-funciona`)

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/lib/seo.ts` | modificar | Adicionar helpers: `buildBreadcrumbJsonLd`, `buildProductJsonLd`, `buildFaqJsonLd` |
| `src/app/(marketing)/[categoria]/page.tsx` | modificar | Buscar `faqs`, renderizar `FaqAccordion` + `BreadcrumbList` JSON-LD + `FAQPage` JSON-LD |
| `src/app/(marketing)/[categoria]/[produto]/page.tsx` | modificar | Completar `Product` JSON-LD + adicionar `BreadcrumbList` JSON-LD |

### Helpers em `src/lib/seo.ts`

**`buildBreadcrumbJsonLd(items: { name: string; href?: string }[])`**

Cada item sem `href` é a página atual (não recebe `item` no schema — correto para o último nível):

```ts
export function buildBreadcrumbJsonLd(
  items: { name: string; href?: string }[]
) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fasesport.com.br'
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.href ? { item: `${base}${item.href}` } : {}),
    })),
  }
}
```

**Estrutura esperada — página de categoria (2 níveis):**
```
Início (href="/")  →  Futebol (sem href — página atual)
```

**Estrutura esperada — página de produto (3 níveis):**
```
Início (href="/")  →  Futebol (href="/futebol")  →  Camisa Futebol Classic (sem href — página atual)
```

**`buildProductJsonLd(product: { name, description?, image? })`**

```ts
export function buildProductJsonLd(product: {
  name: string
  description?: string | null
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: { '@type': 'Brand', 'name': 'Fase Sport' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Fase Sport' },
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        description: 'Preço sob consulta — solicite orçamento',
      },
    },
  }
}
```

> **Sobre `price: "0"`:** omitir o campo `price` completamente é mais seguro do que `price: "0"`. O Google aceita `Offer` sem `price` quando `priceSpecification` está presente. Usar `price: "0"` pode disparar o aviso "price might be misleading" no Rich Results Test. Testar no Rich Results Test após deploy — se aparecer aviso, remover o campo.

**`buildFaqJsonLd(faqs: { question: string; answer: string }[])`**

```ts
export function buildFaqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}
```

### Atualização da query de categoria

Adicionar `faqs` ao `include` existente:

```ts
prisma.category.findUnique({
  where: { slug: categoria },
  include: {
    subcategories: { orderBy: { sortOrder: 'asc' } },
    products: { ... },
    faqs: {                          // ← novo
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    },
  },
})
```

### Renderização do FAQ accordion na categoria

Adicionar após `<ProductGrid>` e antes da seção de CTA, condicionalmente:

```tsx
{category.faqs.length > 0 && (
  <section>
    <h2 className="font-heading text-3xl mb-6">Perguntas Frequentes</h2>
    <FaqAccordion faqs={category.faqs.map(f => ({ question: f.question, answer: f.answer }))} />
  </section>
)}
```

Verificar a interface esperada por `FaqAccordion` antes de mapear (ler `src/components/sections/FaqAccordion.tsx`).

### JSON-LD na categoria — múltiplos scripts

A página de categoria pode ter 2 scripts JSON-LD: `BreadcrumbList` + `FAQPage` (quando há FAQs). Renderizar como dois `<script>` separados — o Google os processa independentemente:

```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd([...])) }} />
{category.faqs.length > 0 && (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(category.faqs)) }} />
)}
```

### JSON-LD na página de produto

Substituir o `jsonLd` inline existente pelos helpers:

```tsx
const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: 'Início', href: '/' },
  { name: category.name, href: `/${category.slug}` },
  { name: product.name },  // sem href — página atual
])

const productJsonLd = buildProductJsonLd({
  name: product.name,
  description: product.description,
  image: primaryImage?.url,
})
```

---

## Checklist de Implementação

- [ ] 1. Confirmar interface de `FaqAccordion` (ler `src/components/sections/FaqAccordion.tsx`)
- [ ] 2. Criar helpers `buildBreadcrumbJsonLd`, `buildProductJsonLd`, `buildFaqJsonLd` em `src/lib/seo.ts`
- [ ] 3. Atualizar query de categoria para incluir `faqs` (com `isActive: true` + `orderBy: sortOrder`)
- [ ] 4. Renderizar `<FaqAccordion>` na página de categoria quando `category.faqs.length > 0`
- [ ] 5. Adicionar `BreadcrumbList` JSON-LD na página de categoria
- [ ] 6. Adicionar `FAQPage` JSON-LD na página de categoria quando há FAQs
- [ ] 7. Substituir `jsonLd` inline na página de produto pelos helpers `buildProductJsonLd` + `buildBreadcrumbJsonLd`
- [ ] 8. Verificar `tsc --noEmit` limpo
- [ ] 9. Testar schemas no Rich Results Test do Google para categoria e produto
- [ ] 10. Se Rich Results Test reportar aviso em `offers` (sem `price`): documentar resultado nos critérios

## Critérios de Aceitação

- [ ] Rich Results Test: `BreadcrumbList` válido sem erros na página de categoria
- [ ] Rich Results Test: `BreadcrumbList` de 3 níveis válido na página de produto
- [ ] Rich Results Test: schema `Product` com `offers` — elegível para rich result de produto, sem aviso de preço
- [ ] Página de categoria com FAQs cadastrados: accordion visível + `FAQPage` JSON-LD presente no DOM
- [ ] Página de categoria sem FAQs: nenhum JSON-LD de FAQ renderizado (sem schema vazio)
- [ ] `process.env.NEXT_PUBLIC_APP_URL` é usado nas URLs absolutas do BreadcrumbList (não hardcoded)

---

## Notas

- A relação `Category → faqs Faq[]` existe no schema (`schema.prisma:24`) — sem migration necessária.
- `Faq.categoryId` é `String?` (opcional) — FAQs sem categoria são globais (usados em `como-funciona`). A query de categoria filtra por `categoryId` implicitamente via `include`.
- Google Rich Results Test: acessar a URL da página após deploy e colar no testador. Em desenvolvimento, usar a opção de "testar por código" colando o HTML da página.
- `buildBreadcrumbJsonLd` usa `NEXT_PUBLIC_APP_URL` — garantir que está definido em todos os ambientes.
