# Planejamento Frontend — Fase 2 (Pré-Produção)

> Documento de planejamento do arquiteto · Criado 2026-06-12 · Revisado 2026-06-12

---

## 1. Estado atual — o que está completo e funcionando

### Backend / Infra (sólido)
- Prisma 7 + schema completo (8 modelos), seed com admin + 8 categorias.
- API pública: `categories`, `categories/[slug]`, `products`, `products/[slug]`, `contact` (rate limit + Resend).
- API admin completa + auth JWT (`jose`) + middleware guard.
- Libs: `db`, `r2`, `resend`, `ratelimit`, `seo`, `site`, validações Zod.
- Upload R2 em `/api/admin/upload/`.

### CMS Admin (completo)
- Login, dashboard, CRUD de produtos (com upload de imagens), categorias, depoimentos, FAQs, leads.

### Frontend público (estruturalmente pronto)
- Layout: `Navbar` + `MobileMenu`, `Footer`, `WhatsAppFab`, `(marketing)/layout.tsx`.
- Homepage: Hero, Categorias, Destaque, Como Funciona, Depoimentos, Por que a Fase, CTA Banner.
- Páginas de categoria (SSG + filtro por subcategoria) e de produto (galeria, CTA WhatsApp, JSON-LD `Product`).
- `como-funciona` (process steps + FAQ global) e `orcamento` (form multi-step 3 passos).
- SEO: `sitemap.ts`, `robots.ts`, JSON-LD `LocalBusiness`, OG/Twitter no metadata global.
- TypeScript: `tsc --noEmit` limpo (Prisma 7 datasource config corrigido).
- Animações: Framer Motion já instalado e em uso (RevealOnScroll, MobileMenu, ProductGallery, TestimonialsSection).

---

## 2. Gaps identificados (com severidade)

### BLOQUEANTE

| # | Gap |
|---|---|
| B1 | **Sem páginas de erro/loading/404/empty states.** `not-found.tsx`, `error.tsx`, `loading.tsx` ausentes. `buildWhatsAppUrl()` sem guard quando env var está vazio (gera URL quebrada). Grid de produtos vazio sem feedback. |
| B2 | **CTA Simulador ausente.** `simulatorUrl` existe no schema mas nunca é renderizado nem selecionado nas queries. URL `simulador.fasesport.com` confirmada ativa. Analytics do clique será coberto na spec de analytics (semana seguinte). |
| B3 | **Zero testes.** Sem `vitest.config.ts` nem `playwright.config.ts`. Fluxos A e B sem cobertura. |
| B4 | **Analytics ausente.** Sem GA4/GTM. KPIs do projeto são imensuráveis sem rastreio de conversão. |

### ALTA

| # | Gap |
|---|---|
| A1 | **Hero sem imagem real.** Usa gradiente CSS. PRD exige visual heavy com fotos de produto reais. Implementar com `next/image priority` (LCP) e `sizes` responsivo — obrigatório para Core Web Vitals. |
| A2 | **ContactSection ausente na home.** PRD §4.1 e spec §19.2 preveem form + mapa; home termina no CtaBanner. |
| A3 | **Google Maps embed ausente.** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` existe mas não é usado. |
| A4 | **Form de orçamento com 3 problemas de UX/A11y:** (1) sem máscara de telefone; (2) inputs sem estado visual de erro (border/aria-invalid/aria-describedby); (3) step indicator com apenas 2 estados visuais — concluído e ativo aparecem iguais, deveriam ser 3 estados distintos; (4) foco não é movido ao avançar steps (impacto em teclado e leitores de tela). |

### MÉDIA

| # | Gap |
|---|---|
| M1 | Busca de produtos não existe (PRD: MÉDIA/V1). |
| M2 | FAQ por modalidade ausente na página de categoria. |
| M3 | **JSON-LD incompleto em dois níveis:** `BreadcrumbList` ausente em categoria e produto; schema `Product` sem campos `offers` (faixa de preço) e `brand` — sem `offers` o produto não aparece em rich results do Google. |
| M4 | A11y a auditar (skip-link, foco visível, contraste WCAG AA). |
| M5 | Edge case: banco vazio na home e grids de catálogo sem empty state definido. _(Coberto por B1.)_ |

### OBSERVADO NO CÓDIGO (não estava no plano original)

| # | Arquivo | Problema |
|---|---|---|
| O1 | `OrcamentoForm.tsx:112` | `i <= step` trata step concluído e step atual como iguais visualmente |
| O2 | `OrcamentoForm.tsx` (advance fn) | Após `setStep`, foco permanece no botão "Próximo" — leitor de tela não sabe que o conteúdo mudou |
| O3 | `produto/page.tsx:65-79` | `simulatorUrl` não está no select do Prisma; CTA nunca renderizará mesmo após fix de UI |
| O4 | `produto/page.tsx:95-101` | JSON-LD Product sem `offers`, `brand` — impede rich results no Google |

---

## 3. Plano de próximas specs (priorizado)

| Spec | ID | Prioridade | Depende de | Status |
|---|---|---|---|---|
| Error/Loading/404 + WhatsApp guard + Empty states | `2026-06-17-error-loading-states` | BLOQUEANTE | — | pendente |
| CTA Simulador | `2026-06-17-cta-simulador` | BLOQUEANTE | ~~URL confirmada~~ ✓ | pendente |
| Homepage: contato + mapa + hero image | `2026-06-18-homepage-contato-mapa` | ALTA | Assets do design | pendente |
| Analytics GA4 + LGPD + CWV targets | `2026-06-18-analytics-eventos` | BLOQUEANTE | Consentimento LGPD redigido | pendente |
| UX form orçamento (máscara + a11y + step UI + foco) | `2026-06-19-form-orcamento-ux` | ALTA | analytics (evento lead_submit) | pendente |
| JSON-LD BreadcrumbList + Product offers + FAQ por categoria | `2026-06-19-seo-jsonld-paginas` | MÉDIA | — | pendente |
| A11y audit | `2026-06-20-a11y-audit` | MÉDIA | — | pendente |
| Testes Vitest unit + Playwright E2E | `2026-06-20-testes-conversao` | BLOQUEANTE (release) | frontend estabilizado | pendente |
| Busca de produtos | `2026-06-21-busca-produtos` | MÉDIA (pode ser pós-launch) | — | pendente |
| Polish + deploy (PRD update, CI/CD) | `2026-06-21-polish-e-deploy` | BAIXA | tudo anterior | pendente |

> **Nota sequencial:** A spec de analytics (`2026-06-18`) vem após o Simulador (`2026-06-17`) por decisão de produto. O evento `simulator_click` será retroativamente coberto pela spec de analytics — o CTA do simulador vai ao ar sem tracking por ~1 dia.

---

## 4. ADRs relevantes

**ADR-1 — Simulador: link externo, não embed.**
CTAs abrem simulador externo em nova aba (`simulatorUrl` do produto se houver, senão `NEXT_PUBLIC_SIMULATOR_URL` global). Rastrear o clique via evento antes de sair. URL `simulador.fasesport.com` confirmada ativa em 2026-06-12.

**ADR-2 — Analytics via `@next/third-parties` + GTM, com consentimento LGPD.**
Usar `@next/third-parties/google` (não bloqueia LCP). Banner de consentimento mínimo controla o carregamento.

**ADR-3 — Erros/loading como arquivos de convenção do App Router.**
`error.tsx`/`loading.tsx`/`not-found.tsx` por segmento. `error.tsx` é Client Component obrigatório.

**ADR-4 — Mapa via iframe embed estático, não JS API.**
Google Maps por `<iframe>` lazy. `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` opcional na V1.

**ADR-5 — Marca vermelho `#CD3438` é a referência; PRD §5.2 está desatualizado.**
Toda nova UI usa tokens (`--primary`, `--brand*`), nunca hex.

**ADR-6 — Core Web Vitals como critério de aceitação de deploy.**
Targets mínimos: LCP < 2.5s, CLS < 0.1, INP < 200ms. Hero image deve usar `next/image` com `priority={true}` e `sizes` responsivo. Imagens de produto já devem estar em AVIF/WebP via R2 ou `next/image` transform.

**ADR-7 — WhatsApp guard obrigatório em `buildWhatsAppUrl()`.**
Se `NEXT_PUBLIC_WHATSAPP_NUMBER` estiver vazio, a função deve retornar URL de fallback (ex: página de contato) ou logar warning em dev. Nunca gerar `wa.me/?text=` sem número.

---

## 5. Riscos e questões abertas

1. ~~**URL do simulador:** `simulador.fasesport.com` está ativo?~~ **Resolvido — confirmado ativo em 2026-06-12.**
2. **Assets reais:** imagem de hero, og-image final, fotos de produto. Bloqueiam percepção visual, não implementação.
3. ~~**`NEXT_PUBLIC_WHATSAPP_NUMBER` vazio** gera `wa.me/?text=` quebrado.~~ **Resolvido — guard entra na spec B1.**
4. **Busca na V1?** Decisão de produto — cortar para fast-follow e priorizar B1–B4?
5. **Consentimento LGPD:** política de privacidade redigida? Necessária antes de GA4 em produção.
6. Framer Motion já instalado e em uso — garantir `useReducedMotion` consistente em todas as animações novas.
7. **OG images dinâmicas por rota** (categoria/produto) não estão no plano de V1. Usar `opengraph-image.tsx` por segmento é pós-launch.
8. **`simulator_click` sem analytics por ~1 dia** (B2 antes de analytics). Aceitável por decisão de produto.
