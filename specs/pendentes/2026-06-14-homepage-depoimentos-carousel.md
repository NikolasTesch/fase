# Homepage: ênfase em "Por que a Fase?" e carrossel de depoimentos com foto do material

> **Status:** `pendente`
> **ID:** `2026-06-14-homepage-depoimentos-carousel`
> **Criada em:** 2026-06-14
> **Agente:** arquiteto

---

## Contexto

A homepage atual exibe os depoimentos via `TestimonialsSection`, um grid estático de 3 colunas com aspas, nome, time e estrelas — sem prova visual do produto entregue. A seção "Por que a Fase?" (`WhySection`) aparece depois dos depoimentos com peso visual baixo (grid de 4 cards pequenos e header discreto).

O dono pediu três mudanças:

1. **Remover** a seção "O que dizem nossos times" no formato grid estático atual.
2. **Dar mais ênfase** à seção "Por que a Fase?" — torná-la mais proeminente na página.
3. **Adicionar carrossel de depoimentos** onde cada card traz: texto do depoimento, nome/time do cliente **e uma foto do material/uniforme recebido** — provando visualmente a qualidade.

O modelo `Testimonial` hoje tem `photoUrl` (foto do cliente) e `logoUrl` (escudo do time), mas **nenhum campo para a foto do uniforme entregue**. Sem prova visual do produto, o impacto de conversão dos depoimentos é baixo — eles competem com a identidade do produto, que é "visual heavy" por natureza (PRD: imagens reais de produto são prioridade).

**Impacto de não fazer:** a homepage perde a oportunidade de combinar prova social + prova visual do produto, que é o gatilho de conversão mais forte para uniformes personalizados.

---

## Objetivos

- [ ] Remover o grid estático de depoimentos (`TestimonialsSection`) da homepage
- [ ] Adicionar campo `materialImageUrl String?` ao modelo `Testimonial` para a foto do uniforme entregue
- [ ] Criar `TestimonialsCarousel` (Client Component) com Framer Motion v12: autoplay 4s, navegação por dots, swipe mobile via `drag="x"`, respeitando `useReducedMotion`
- [ ] Cada slide exibe: foto do material (ou fallback de marca), texto do depoimento, nome e time do cliente
- [ ] Reforçar visualmente a `WhySection` e reposicioná-la antes do carrossel
- [ ] Atualizar a ordem das seções da homepage

## Fora de escopo

- CRUD de depoimentos no admin / upload de `materialImageUrl` pela UI — spec futura
- Migração/backfill das fotos reais de material (depende do cliente fornecer as imagens)
- Alterar `photoUrl` / `logoUrl` existentes

---

## Abordagem Técnica

### Modelo de dados

```prisma
// prisma/schema.prisma — adicionar ao model Testimonial:
materialImageUrl String?
```

Campo separado de `photoUrl`/`logoUrl` (semânticas distintas: foto do uniforme entregue ≠ rosto do cliente). Opcional (`String?`) para não quebrar registros existentes. Imagens no R2 — hosts já whitelisted em `next.config.ts`.

Aplicar via: `npx prisma migrate dev --name testimonial_material_image`

### Fluxo de dados

- `page.tsx` (Server Component) faz `prisma.testimonial.findMany` **sem `select`** — o novo campo `materialImageUrl` já virá automaticamente após a migration. Basta mapeá-lo em `testimonialItems`.
- Dados descem por props para o Client Component do carrossel. Nenhuma chamada de dados no client.
- Slides sem `materialImageUrl`: renderizar fallback visual (placeholder com marca).

### Carrossel — Framer Motion v12 (sem libs novas)

Novo `TestimonialsCarousel` (`"use client"`):

- **Transição:** `AnimatePresence mode="wait"` + `motion.div` com variants direcionais (entra de uma lateral, sai pela outra). Com `useReducedMotion()`, troca instantânea sem animação.
- **Autoplay:** `useEffect` com `setInterval(4000)` avançando o índice. Pausar em `hover`/`focus-within` e quando `useReducedMotion()` for `true`.
- **Swipe mobile:** `drag="x"` + `dragConstraints={{ left: 0, right: 0 }}` + `onDragEnd` com threshold ~80px.
- **Dots:** `<button aria-label="Ir para depoimento N" aria-current>` por slide, navegáveis por teclado.
- **Prev/next (desktop):** `<button aria-label="Depoimento anterior/próximo">` com `ChevronLeft`/`ChevronRight` de `lucide-react`.
- **Acessibilidade:** wrapper com `aria-live="polite"` e `aria-roledescription="carrossel"`; texto do depoimento sempre no DOM (SSR/SEO); `alt` descritivo na foto.

**Layout:** mobile — foto no topo (aspect ratio fixo, `next/image` lazy), texto + nome abaixo. `lg:` — duas colunas (foto esquerda ~50%, texto direita). `max-w-7xl px-4` padrão do projeto.

### "Por que a Fase?" em destaque

Modificar `WhySection.tsx`:
- Eyebrow/kicker em `text-primary` acima do `h2`
- Título `text-5xl lg:text-6xl`, header centralizado
- Ícones maiores (`size-14` no badge, `size-7` no ícone) e mais respiro nos cards
- Manter `StaggerContainer`/`StaggerItem` e `RevealOnScroll` existentes

### Nova ordem das seções (ordem canônica — fonte de verdade)

Esta tabela é a referência de ordenação para **todas** as specs que modificam `(marketing)/page.tsx`.

| # | Seção | Mudança | Spec responsável |
|---|---|---|---|
| 1 | `HeroSection` | — | — |
| 2 | `CategoriesSection` | reformulada em 5 blocos temáticos | `reformulacao-modalidades` |
| 3 | `FeaturedSection` | carrossel de 10s, até 16 produtos | `destaques-carrossel` |
| 4 | `HowItWorksSection` | expandida para 6 passos com SVGs | `como-funciona-vetores` |
| 5 | `WhySection` | **subiu** + reforço visual | esta spec |
| 6 | `TestimonialsCarousel` | **novo** (substitui `TestimonialsSection`) | esta spec |
| 7 | `CustomizationCtaSection` + `UniformsCarouselSection` | **novo** | `personalizacao-e-carrossel` |
| 8 | `ContactSection` | — | — |
| 9 | `CtaBannerSection` | — | — |
| 10 | `InstagramSection` | **novo** | `instagram-section` |

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `prisma/schema.prisma` | modificar | Adicionar `materialImageUrl String?` ao model `Testimonial` |
| `prisma/migrations/` | criar | Migration nullable gerada via `prisma migrate dev` |
| `src/components/sections/TestimonialsCarousel.tsx` | criar | Client Component do carrossel |
| `src/components/sections/TestimonialsSection.tsx` | deletar | Grid estático antigo |
| `src/components/sections/WhySection.tsx` | modificar | Reforço visual: eyebrow, título maior, header centralizado, cards maiores |
| `src/app/(marketing)/page.tsx` | modificar | Trocar `TestimonialsSection` por `TestimonialsCarousel`, reordenar `WhySection`, mapear `materialImageUrl` |
| `prisma/seed.ts` | modificar | Popular `materialImageUrl` nos depoimentos de exemplo |

### Decisões técnicas (ADR)

**ADR-1 — `materialImageUrl` como campo escalar separado.**
Alternativas: (a) reutilizar `photoUrl`; (b) tabela `TestimonialImage` 1-N. Decisão: campo escalar `String?`. Consequência: semântica clara, zero quebra de dados existentes, sem join. Se no futuro um depoimento precisar de várias fotos, será nova spec.

**ADR-2 — Carrossel próprio com Framer Motion v12, sem Embla/Swiper.**
O projeto já padroniza animações com `framer-motion` e `useReducedMotion`. Decisão: `motion.div` + `AnimatePresence` + `drag`. Consequência: zero bundle adicional, controle total de a11y e reduced-motion. Swipe manual via threshold de `onDragEnd`.

**ADR-3 — Server busca, Client anima.**
Dados vêm do Server Component (`page.tsx`) via props; o carrossel é `"use client"` só pela interatividade. Mantém SSR — texto dos depoimentos está no HTML inicial (SEO).

**ADR-4 — CRUD admin do novo campo fora de escopo.**
A página admin de depoimentos é atualmente read-only; o botão "Novo" é placeholder (`href="#"`). Adicionar upload de imagem requer form + endpoint + revisão de segurança — escopo próprio em spec futura.

---

## Checklist de Implementação

- [ ] 1. `prisma/schema.prisma`: adicionar `materialImageUrl String?` ao model `Testimonial`
- [ ] 2. Rodar `npx prisma migrate dev --name testimonial_material_image` e confirmar SQL nullable. Rodar `npx prisma generate`
- [ ] 3. Atualizar `prisma/seed.ts` para popular `materialImageUrl` com URLs de placeholder em ≥ 3 depoimentos de exemplo
- [ ] 4. Criar `src/components/sections/TestimonialsCarousel.tsx` (`"use client"`):
  - Props: `testimonials: { id; name; role?; content; rating?; materialImageUrl?: string | null }[]`
  - `AnimatePresence mode="wait"` + `motion.div` com variants direcionais
  - Autoplay 4s — pausar em `hover`/`focus-within` e quando `useReducedMotion()` for `true`
  - `drag="x"` + `onDragEnd` com threshold ~80px para swipe mobile
  - Dots: `<button aria-label>` por slide com `aria-current` no ativo
  - Prev/next com `ChevronLeft`/`ChevronRight` de `lucide-react`, visíveis só em `lg:`
  - Wrapper com `aria-live="polite"` e `aria-roledescription="carrossel"`
  - `next/image` para a foto do material com `alt` descritivo; fallback quando `materialImageUrl` ausente
  - `return null` se lista vazia
- [ ] 5. Modificar `src/components/sections/WhySection.tsx`:
  - Adicionar eyebrow/kicker em `text-primary` acima do `h2`
  - Título `text-5xl lg:text-6xl`, header centralizado
  - Ícones/badges maiores, mais padding nos cards
  - Manter `RevealOnScroll`, `StaggerContainer`/`StaggerItem`
- [ ] 6. Modificar `src/app/(marketing)/page.tsx`:
  - Mapear `materialImageUrl` em `testimonialItems` (campo já vem do `findMany`)
  - Substituir `<TestimonialsSection>` por `<TestimonialsCarousel testimonials={testimonialItems} />`
  - Reordenar seções: `WhySection` antes do `TestimonialsCarousel`
  - Atualizar imports
- [ ] 7. Deletar `src/components/sections/TestimonialsSection.tsx`
- [ ] 8. Grep no repositório para confirmar que não restam imports de `TestimonialsSection`
- [ ] 9. Rodar `npm run type-check`, `npm run lint`, `npm run test:unit`
- [ ] 10. Testar visualmente em mobile (375px) e desktop: autoplay, swipe, dots, prev/next, reduced-motion, fallback sem `materialImageUrl`

## Critérios de Aceitação

- [ ] A coluna `materialImageUrl` existe na tabela e é nullable; registros antigos funcionam sem alteração
- [ ] A homepage não exibe mais o grid "O que dizem nossos times"
- [ ] O carrossel exibe cada depoimento com foto do material (ou fallback), texto, nome e time
- [ ] Autoplay avança a cada 4s; pausa no hover/focus; dots e setas navegam; swipe funciona em mobile
- [ ] Com `prefers-reduced-motion: reduce`, não há autoplay nem animação; conteúdo permanece acessível
- [ ] Controles têm `aria-label`; região tem `aria-live`; navegável por teclado
- [ ] "Por que a Fase?" aparece antes do carrossel com header maior e cards mais proeminentes
- [ ] Texto dos depoimentos está no HTML renderizado pelo servidor (verificar view-source)
- [ ] `npm run build` sem erros; sem imports órfãos de `TestimonialsSection`

---

## Notas

- Reutilizar o padrão de `useReducedMotion` de `RevealOnScroll.tsx` e `AnimatedSection.tsx` para consistência
- Hosts de imagem já whitelisted em `next.config.ts` — não alterar
- `page.tsx` faz `findMany` sem `select` → `materialImageUrl` já virá após a migration; basta mapear
- LCP: imagem do carrossel fica abaixo da dobra — manter `loading="lazy"` para não competir com o Hero
- **Questão aberta:** o admin precisará, em breve, de UI para upload de `materialImageUrl` — registrar spec de follow-up para o form de depoimentos
