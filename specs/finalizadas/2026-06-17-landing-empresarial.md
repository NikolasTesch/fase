# Landing Page Dedicada — Segmento Empresarial

> **Status:** `finalizada`
> **ID:** `2026-06-17-landing-empresarial`
> **Criada em:** 2026-06-17
> **Agente:** arquiteto

---

## Contexto

A categoria `empresarial` já existe no banco e o dropdown "Empresarial" no Navbar já funciona. No entanto, a rota `/empresarial` cai na página genérica `[categoria]/page.tsx`, que exibe apenas um grid de produtos — sem diferenciação visual para o público B2B corporativo.

O usuário pediu uma landing page dedicada com **mockups estruturais** para que o admin preencha os produtos reais via CMS. O seed também só tem 2 dos 4 segmentos populados (faltam `operacional` e `promocional`).

---

## Objetivos

- [ ] Criar `src/app/(marketing)/empresarial/page.tsx` — página dedicada que toma precedência sobre `[categoria]/page.tsx` para a rota `/empresarial`
- [ ] A página exibe: Hero B2B → Cards dos 4 Segmentos → Grid de produtos (filtrado por `?sub=X` se presente) → Diferenciais corporativos → CTA (orçamento + WhatsApp)
- [ ] Criar componente `src/components/sections/SegmentosEmpresariais.tsx` — 4 cards visuais linkando para `/empresarial?sub=X`
- [ ] Criar componente `src/components/sections/DiferenciaisEmpresariais.tsx` — 3–4 diferenciais do serviço corporativo
- [ ] Completar o seed com produtos placeholder para `operacional` e `promocional`
- [ ] Gerar metadata (SEO) específica para a página empresarial

## Fora de escopo

- Novo painel admin para gestão de conteúdo empresarial (usa CMS já existente)
- Criação de nova tabela/modelo no Prisma
- OG image dinâmica (pode ser adicionado depois)
- Página dedicada por subcategoria (ex: `/empresarial/polo`) — usa filtro `?sub=` na mesma página

---

## Abordagem Técnica

### Estrutura da página `/empresarial`

```
EmpresarialHero       ← hero B2B com headline + 2 CTAs
SegmentosEmpresariais ← 4 cards: Social, Polo, Operacional, Promocional
                        (se ?sub=X, scroll/highlight automático para o segmento)
ProductGrid           ← reusa componente existente; filtra por subcategoria se ?sub presente
DiferenciaisEmpresariais ← 3 diferenciais: bordado/silk, fardamento completo, entrega garantida
CTA Section           ← inline: Solicitar Orçamento + WhatsApp Empresarial
```

### Roteamento

Em Next.js App Router, a rota estática `(marketing)/empresarial/page.tsx` tem precedência sobre `(marketing)/[categoria]/page.tsx`. Os links do navbar (`/empresarial?sub=social`) continuam funcionando — o `searchParams.sub` é lido pelo novo page.tsx.

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/(marketing)/empresarial/page.tsx` | criar | Landing dedicada B2B; lê `?sub` de searchParams |
| `src/components/sections/SegmentosEmpresariais.tsx` | criar | 4 cards de segmento com ícone, label e link |
| `src/components/sections/DiferenciaisEmpresariais.tsx` | criar | Bloco de 3 diferenciais corporativos |
| `prisma/seed.ts` | modificar | Adicionar produtos para `operacional` e `promocional` |

### Decisões técnicas (ADR)

**ADR-27 — Não duplicar CategoryHero:** reusar `CategoryHero` existente para o hero da página empresarial, passando a imagem placeholder (`/images/categories/empresarial-hero.jpg`). O admin substitui via CMS ao ter imagem real.

**ADR-28 — ProductGrid condicional:** se nenhum `?sub` presente, mostrar todos os produtos da categoria `empresarial`; se `?sub=X`, filtrar pela subcategoria. Usa a mesma query do `getCategoryData` do `[categoria]/page.tsx`.

**ADR-29 — Mockups com imagens placeholder:** produtos usam `/images/products/placeholder.png` até admin adicionar imagens reais. Nenhuma lógica especial — o CMS existente resolve.

---

## Checklist de Implementação

- [ ] 1. Completar o seed: adicionar produtos para `operacional` (ex: "Jaleco Operacional", "Uniforme Brim") e `promocional` (ex: "Camiseta Promocional Dry-fit", "Kit Evento")
- [ ] 2. Criar `SegmentosEmpresariais.tsx` — 4 cards responsivos com ícone SVG, título do segmento e link
- [ ] 3. Criar `DiferenciaisEmpresariais.tsx` — lista de 3 diferenciais (bordado/silk, fardamento completo, prazo garantido)
- [ ] 4. Criar `src/app/(marketing)/empresarial/page.tsx` — montar as seções, gerar metadata, exportar default
- [ ] 5. Verificar que `npm run build` compila sem erros

## Critérios de Aceitação

- [ ] `/empresarial` carrega a landing dedicada (não a página genérica de categoria)
- [ ] `/empresarial?sub=polo` exibe os produtos da subcategoria Polo Profissional
- [ ] Todos os 4 segmentos têm pelo menos 1 produto placeholder no banco
- [ ] A página tem metadata (title/description) própria para SEO B2B
- [ ] Build `next build` passa sem erros de tipo

---

## Notas

- Imagens placeholder: usar `/images/products/placeholder.png` ou deixar `imageUrl: null` (ProductCard já trata fallback)
- Após aprovação, admin usa o CMS existente em `/admin/produtos` para adicionar imagens reais e ajustar descrições
- Os 4 segmentos já estão no DB se o seed foi rodado; apenas os produtos de `operacional` e `promocional` estão faltando
