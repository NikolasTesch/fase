# SEO Global e Metadata por Página

> **Status:** `pendente`
> **ID:** `2026-06-16-seo-e-metadata`
> **Criada em:** 2026-06-12
> **Agente:** arquiteto

---

## Contexto

SEO por modalidade é meta crítica do projeto (PRD §1.2 e §6; spec.md §20). Faltam sitemap dinâmico, robots.txt, OG image padrão e Schema.org `LocalBusiness`. Esta spec fecha a camada de descobribilidade — deve ser implementada após as páginas existirem, pois o sitemap as referencia.

## Objetivos

- [ ] Criar `src/app/sitemap.ts` (dinâmico: home, estáticas, categorias ativas, produtos ativos)
- [ ] Criar `src/app/robots.ts` (allow `/`, disallow `/admin/`)
- [ ] Referenciar OG image padrão (`/og-image.jpg`) no metadata global do root layout
- [ ] Adicionar JSON-LD `LocalBusiness` no layout raiz
- [ ] Confirmar `lang="pt-BR"` e `metadataBase` (já no root layout — apenas verificar)

## Fora de escopo

- GA4/GTM (rastreamento) — entrega separada
- OG images dinâmicas geradas via `ImageResponse` (usar imagem do produto no `generateMetadata` já basta)
- Schema.org `Product` e `BreadcrumbList` por página (implementados nas specs de produto/categoria)

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/lib/seo.ts` | criar | Helper `organizationJsonLd()` retornando objeto `LocalBusiness` com nome, url, logo, telefone WhatsApp, endereço Colatina-ES |
| `src/app/sitemap.ts` | criar | `MetadataRoute.Sitemap`. Lê `NEXT_PUBLIC_APP_URL`. Inclui rotas estáticas + categorias ativas + produtos ativos (query Prisma corrigida) |
| `src/app/robots.ts` | criar | `MetadataRoute.Robots`. `allow: '/'`, `disallow: '/admin/'`, referencia `sitemap.xml` |
| `src/app/layout.tsx` | modificar | Adicionar `openGraph.images` e `twitter.card` apontando `/og-image.jpg`; injetar `<script type="application/ld+json">` com `organizationJsonLd()` |
| `public/og-image.jpg` | adicionar | Asset 1200×630 px — solicitar ao design. Placeholder pode ser usado no desenvolvimento |

### Decisões técnicas (ADR)

**`LocalBusiness` em vez de `Organization`.** A Fase Sport é um negócio local em Colatina-ES. `LocalBusiness` é subtipo de `Organization` e inclui endereço/telefone, sendo mais específico e relevante para SEO local (PRD §1.2: "ranquear para 'uniformes esportivos Colatina'").

**Sitemap dinâmico via Prisma direto.** Reflete categorias/produtos ativos automaticamente. Não usar `fetch` HTTP interno na rota — Prisma direto é mais eficiente e correto.

**Bug de query a corrigir (spec.md §20.1 usa `select` + `include` conflitantes).** A query correta para o sitemap de produtos:
```ts
prisma.product.findMany({
  where: { isActive: true },
  select: {
    slug: true,
    updatedAt: true,
    category: { select: { slug: true } }
  }
})
```

**`robots.ts` e `sitemap.ts` como rotas App Router.** Em vez de arquivos estáticos em `public/`, usar as rotas de metadata do Next.js 16 — permitem conteúdo dinâmico e são a convenção atual.

**OG global + override por página.** Imagem padrão no root metadata; páginas de produto/categoria sobrescrevem via seus `generateMetadata`. `metadataBase` já está no root layout e garante que URLs relativas (`/og-image.jpg`) são resolvidas corretamente.

---

## Checklist de Implementação

- [ ] 1. Criar `src/lib/seo.ts` com `organizationJsonLd()` (tipo `LocalBusiness`, nome "Fase Sport", url, logo, telefone via `SITE_CONTACT`, endereço Colatina-ES)
- [ ] 2. Criar `src/app/sitemap.ts`: rotas estáticas (`/`, `/orcamento`, `/como-funciona`) + query corrigida de categorias e produtos ativos
- [ ] 3. Criar `src/app/robots.ts`: allow `/`, disallow `/admin/`, `sitemap: ${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`
- [ ] 4. Adicionar `public/og-image.jpg` (1200×630) — para desenvolvimento, criar placeholder: JPEG sólido na cor brand `#CD3438` com dimensões 1200×630 px (qualquer ferramenta serve; o asset final de produção será entregue pelo design)
- [ ] 5. Em `src/app/layout.tsx`: adicionar `openGraph: { images: ['/og-image.jpg'] }` e `twitter: { card: 'summary_large_image' }` ao `metadata`
- [ ] 6. Em `src/app/layout.tsx`: injetar `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />` no `<body>` (após `{children}`)
- [ ] 7. Verificar (não modificar se correto): `lang="pt-BR"` e `metadataBase` no root layout

## Critérios de Aceitação

- [ ] `GET /sitemap.xml` lista `/`, `/orcamento`, `/como-funciona` e uma entrada por categoria e produto ativos
- [ ] `GET /robots.txt` contém `Disallow: /admin/` e referencia o sitemap
- [ ] HTML de `/` contém `<script type="application/ld+json">` com `"@type":"LocalBusiness"` e endereço de Colatina-ES
- [ ] Metatags OG (`og:image`, `og:title`, `og:description`) presentes nas páginas públicas
- [ ] `twitter:card` presente no HTML
- [ ] `<html lang="pt-BR">` e `<link rel="canonical">` (via `metadataBase`) confirmados
- [ ] A query do sitemap não lança erro de Prisma (`select` sem `include` conflitante)
- [ ] `npx tsc --noEmit` sem erros

---

## Notas

- Depende de `SITE_CONTACT` de `src/lib/site.ts` (spec `2026-06-13-layout-publico`) para endereço e telefone.
- Implementar **após** as páginas públicas existirem (specs 13–15) — o sitemap referencia rotas que precisam existir.
- `metadataBase` e `lang="pt-BR"` já estão corretos no root layout — apenas confirmar, não duplicar.
- `public/og-image.jpg`: dimensões mínimas 1200×630. Durante desenvolvimento, um placeholder colorido simples com o logo já serve para testar as tags OG.
