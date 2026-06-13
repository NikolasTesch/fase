# Página de Categoria por Modalidade

> **Status:** `pendente`
> **ID:** `2026-06-14-pagina-categoria`
> **Criada em:** 2026-06-12
> **Agente:** arquiteto

---

## Contexto

O catálogo por modalidade é funcionalidade crítica (PRD §4.2) e o passo 2–3 do Fluxo A. A rota dinâmica `/{categoria}` não existe. Ela lista os modelos de uma categoria com filtro por subcategoria e CTA de orçamento, alimentando a navegação até a página de produto.

## Objetivos

- [ ] Criar `src/app/(marketing)/[categoria]/page.tsx` (Server Component)
- [ ] Hero da categoria (imagem + nome + descrição + breadcrumb)
- [ ] Filtro por subcategoria (pills) atualizando a URL via `?sub=`
- [ ] Grid de produtos com `ProductGrid` + `ProductCard`
- [ ] CTA de orçamento
- [ ] `generateStaticParams` e `generateMetadata` dinâmicos

## Fora de escopo

- Página de detalhe do produto (spec `2026-06-14-pagina-produto`)
- FAQ da modalidade (iteração futura)
- Ordenação por relevância
- Schema.org `BreadcrumbList` (spec `2026-06-16-seo-e-metadata`)

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/(marketing)/[categoria]/page.tsx` | criar | Server Component. `params` e `searchParams` são `Promise` (Next 16) — sempre `await`. `generateStaticParams` + `generateMetadata`. `notFound()` se categoria inativa/inexistente |
| `src/components/products/ProductGrid.tsx` | criar | Server Component. Recebe `products` e renderiza grid responsivo (1/2/3 colunas); estado vazio amigável |
| `src/components/products/SubcategoryFilter.tsx` | criar | `"use client"`. Pills de subcategoria; ao clicar faz `router.push('?sub=slug')`. "Todos" limpa o filtro |
| `src/components/layout/Breadcrumb.tsx` | criar | Server Component reutilizável. Recebe `items: { label: string; href?: string }[]` |
| `src/components/sections/CategoryHero.tsx` | criar | Server Component. Imagem de fundo (`imageUrl`), nome em `font-heading`, descrição |

### Decisões técnicas (ADR)

**`generateStaticParams` (SSG) em vez de ISR.** Categorias mudam raramente e são poucas (8). Pré-renderizar no build dá o melhor SEO/LCP. Conteúdo novo entra em redeploy — aceitável na V1.

**Filtragem via `searchParams` no servidor.** O `ProductCard` precisa estar em HTML SSR para SEO; a filtragem acontece no Server Component relendo `searchParams.sub` e refazendo a query Prisma. `SubcategoryFilter` é ilha cliente que só altera a URL. Como `searchParams` torna a página dinâmica, `generateStaticParams` cobre a casca por categoria e as variações `?sub=` são renderizadas sob demanda.

**`params`/`searchParams` são `Promise` no Next 16.** Tipar como `Promise<{ categoria: string }>` e `Promise<{ sub?: string }>` respectivamente; usar `await` antes de acessar.

**`<Button render={<Link/>}>` para CTAs** — não `asChild` (base-ui, ver spec `2026-06-13-layout-publico`).

### Estrutura da página (ordem)

1. `Breadcrumb`: Home → [Categoria]
2. `CategoryHero`
3. `SubcategoryFilter` (pills)
4. `ProductGrid` (filtrado por `?sub=`)
5. CTA orçamento → `/orcamento?sport={slug}` + link WhatsApp com mensagem da modalidade

---

## Checklist de Implementação

- [ ] 1. Criar `src/components/layout/Breadcrumb.tsx` (reutilizável, `items` prop)
- [ ] 2. Criar `src/components/products/ProductGrid.tsx` (grid responsivo 1/2/3 colunas + estado vazio)
- [ ] 3. Criar `src/components/products/SubcategoryFilter.tsx` (`"use client"`, `useRouter`, `useSearchParams`)
- [ ] 4. Criar `src/components/sections/CategoryHero.tsx` (imagem, nome `font-heading`, descrição)
- [ ] 5. Criar `src/app/(marketing)/[categoria]/page.tsx`:
  - `await params` e `await searchParams`
  - Query Prisma: categoria + subcategorias + produtos filtrados (por `isActive: true` e `subcategory.slug` se `sub` presente)
  - `notFound()` se categoria não existe ou `isActive: false`
  - Montar página na ordem definida
- [ ] 6. Adicionar `generateStaticParams`: query `prisma.category.findMany({ where: { isActive: true }, select: { slug: true } })`
- [ ] 7. Adicionar `generateMetadata`: `seoTitle`/`seoDesc` do banco; fallback `"Uniformes de {name} Personalizados | Fase Sport"`

## Critérios de Aceitação

- [ ] `/futebol` renderiza hero, filtro e grid com produtos em HTML SSR
- [ ] Clicar numa pill de subcategoria atualiza `?sub=` e o grid exibe só aquela subcategoria
- [ ] "Todos" remove `?sub=` e exibe todos os produtos ativos da categoria
- [ ] Categoria inexistente ou inativa retorna 404
- [ ] `generateStaticParams` gera uma rota para cada categoria ativa
- [ ] `<title>` e `<meta description>` variam por categoria
- [ ] Grid: 1 coluna em 375px, 2 em tablet, 3 em desktop
- [ ] `npx tsc --noEmit` sem erros

---

## Notas

- `ProductCard` vem da spec `2026-06-13-homepage`; se as specs forem implementadas fora de ordem, criar `ProductCard` primeiro.
- `GET /api/categories/[slug]` já existe; preferir Prisma direto no Server Component (spec.md §15.3), mas a forma do `include` da API serve de referência.
- CTA WhatsApp da categoria: `buildWhatsAppUrl("Olá Fase Sport! Quero uniforme de {category.name}.")`.
