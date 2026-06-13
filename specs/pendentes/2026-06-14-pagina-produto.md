# Página de Detalhe do Produto

> **Status:** `pendente`
> **ID:** `2026-06-14-pagina-produto`
> **Criada em:** 2026-06-12
> **Agente:** arquiteto

---

## Contexto

É o ponto de conversão do Fluxo A (PRD §5.5): o visitante vê o modelo e clica em "Chamar no WhatsApp" com mensagem pré-formatada, ou solicita orçamento pré-preenchido com o slug do produto. A rota `/{categoria}/{produto}` não existe.

## Objetivos

- [ ] Criar `src/app/(marketing)/[categoria]/[produto]/page.tsx` (Server Component)
- [ ] Galeria com imagem principal + thumbnails clicáveis
- [ ] Nome, descrição, tecido, quantidade mínima
- [ ] CTA primário WhatsApp com mensagem pré-formatada; CTA secundário "Solicitar Orçamento" → `/orcamento?produto={slug}`
- [ ] Breadcrumb: Home → Categoria → Produto
- [ ] `generateStaticParams`, `generateMetadata` e JSON-LD `Product`

## Fora de escopo

- Edição de produtos (admin já existe)
- Produtos relacionados / cross-sell
- Zoom on-hover avançado

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/(marketing)/[categoria]/[produto]/page.tsx` | criar | Server Component. `generateStaticParams`, `generateMetadata`, `notFound()`, JSON-LD `Product` |
| `src/components/products/ProductGallery.tsx` | criar | `"use client"`. Imagem principal + strip de thumbnails clicáveis; swipe mobile via Framer Motion + `useReducedMotion`; `next/image fill` |
| `src/components/products/ProductWhatsAppCta.tsx` | criar | Server Component. Link `wa.me` com `buildWhatsAppUrl` e mensagem do produto. `data-testid="product-whatsapp-cta"` |

### Decisões técnicas (ADR)

**Galeria é a única ilha cliente.** Troca de imagem e swipe exigem estado/gesto → `"use client"`. O resto (textos, CTAs, breadcrumb, JSON-LD) fica Server Component para SEO.

**CTA WhatsApp pode ser Server Component.** A mensagem é montada no servidor com `product.name` e `category.name`:
`"Olá Fase Sport! Vi o modelo {product.name} e quero um orçamento para uniforme de {category.name}."`.
Usa `buildWhatsAppUrl(msg)` de `src/lib/site.ts`.

**Pré-preenchimento por query param.** O CTA secundário leva a `/orcamento?produto={slug}&sport={category.slug}`. A spec `2026-06-15-pagina-orcamento` consome esses params.

**SSG para SEO/LCP.** `generateStaticParams` pré-renderiza todos os produtos ativos. Galeria carrega a imagem principal com `priority`.

**Bug de query a evitar.** O spec.md §19.4 usa `select` + `include` juntos para `category` — inválido no Prisma. Usar apenas `select` aninhado:
```ts
select: { slug: true, category: { select: { slug: true } } }
```

### Estrutura da página (ordem)

1. `Breadcrumb`: Home → Categoria → Produto
2. Grid 2 colunas (desktop): `ProductGallery` | bloco de info
3. Bloco info: nome (`font-heading text-4xl`), badge tecido, qtd mínima, descrição, CTA WhatsApp (primário, `bg-primary`) + "Solicitar Orçamento" (secundário, `variant="outline"`)
4. `<script type="application/ld+json">` com `@type: "Product"`

---

## Checklist de Implementação

- [ ] 1. Criar `src/components/products/ProductGallery.tsx` (`"use client"`, thumbnails, swipe Framer Motion, `useReducedMotion`, `next/image`)
- [ ] 2. Criar `src/components/products/ProductWhatsAppCta.tsx` (`buildWhatsAppUrl`, mensagem com nome do produto, `data-testid`)
- [ ] 3. Criar `src/app/(marketing)/[categoria]/[produto]/page.tsx`:
  - `await params`
  - Query Prisma: produto por slug (com `images` ordenadas + `category`)
  - `notFound()` se produto inexistente ou `isActive: false`
  - Verificar que `category.slug` bate com `params.categoria` (evitar URLs canônicas erradas)
  - Montar layout 2 colunas + Breadcrumb + JSON-LD
- [ ] 4. Adicionar `generateStaticParams`: `select` aninhado correto (sem `include` + `select` conflitantes)
- [ ] 5. Adicionar `generateMetadata`: usa `seoTitle`/`seoDesc`, OG com URL da imagem principal

## Critérios de Aceitação

- [ ] `/futebol/{slug-ativo}` renderiza galeria, info e os 2 CTAs
- [ ] Link WhatsApp (`data-testid="product-whatsapp-cta"`) tem `href` casando `/^https:\/\/wa\.me\//` e contém o nome do produto codificado
- [ ] "Solicitar Orçamento" navega para `/orcamento?produto={slug}`
- [ ] Clicar numa thumbnail troca a imagem principal
- [ ] Produto inexistente ou inativo → 404
- [ ] HTML inclui `<script type="application/ld+json">` com `"@type":"Product"`
- [ ] `generateStaticParams` não lança erro de Prisma
- [ ] `npx tsc --noEmit` sem erros

---

## Notas

- Reutiliza `Breadcrumb` (spec `2026-06-14-pagina-categoria`) e `buildWhatsAppUrl` (spec `2026-06-13-layout-publico`).
- O teste E2E (spec.md §16.2) procura link com texto "chamar no whatsapp" e `href` `wa.me` — garantir texto acessível no CTA.
- `GET /api/products/[slug]` já existe; usar como referência do shape do `include`, mas preferir Prisma direto na page.
