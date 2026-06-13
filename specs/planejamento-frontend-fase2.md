# Planejamento Frontend — Fase 2 (Pré-Produção)

> Documento de planejamento do arquiteto · 2026-06-12

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
| B1 | **Sem páginas de erro/loading/404.** `not-found.tsx`, `error.tsx`, `loading.tsx` ausentes. |
| B2 | **CTA Simulador ausente.** `simulatorUrl` existe no schema mas nunca é renderizado. PRD §4.1, Fluxo A, prioridade ALTA. |
| B3 | **Zero testes.** Sem `vitest.config.ts` nem `playwright.config.ts`. Fluxos A e B sem cobertura. |
| B4 | **Analytics ausente.** Sem GA4/GTM. KPIs do projeto são inmensuráveis sem rastreio de conversão. |

### ALTA

| # | Gap |
|---|---|
| A1 | **Hero sem imagem real.** Usa gradiente CSS. PRD exige visual heavy com fotos de produto reais. |
| A2 | **ContactSection ausente na home.** PRD §4.1 e spec §19.2 preveem form + mapa; home termina no CtaBanner. |
| A3 | **Google Maps embed ausente.** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` existe mas não é usado. |
| A4 | **Form de orçamento sem máscara de telefone e sem aria-invalid/aria-describedby.** |

### MÉDIA

| # | Gap |
|---|---|
| M1 | Busca de produtos não existe (PRD: MÉDIA/V1). |
| M2 | FAQ por modalidade ausente na página de categoria. |
| M3 | `BreadcrumbList` JSON-LD ausente em categoria e produto. |
| M4 | A11y a auditar (skip-link, foco visível, contraste WCAG AA). |
| M5 | Edge case: banco vazio na home comunica pouco. |

---

## 3. Plano de próximas specs (priorizado)

| Spec | ID | Prioridade | Depende de |
|---|---|---|---|
| Error/Loading/404 states | `2026-06-17-error-loading-states` | BLOQUEANTE | — |
| CTA Simulador | `2026-06-17-cta-simulador` | BLOQUEANTE | URL do simulador confirmada |
| Analytics GA4 + LGPD | `2026-06-18-analytics-eventos` | BLOQUEANTE | Consentimento LGPD redigido |
| Homepage: contato + mapa + hero image | `2026-06-18-homepage-contato-mapa` | ALTA | Assets do design |
| UX form orçamento (máscara + a11y) | `2026-06-19-form-orcamento-ux` | ALTA | analytics (evento lead_submit) |
| JSON-LD BreadcrumbList + FAQ por categoria | `2026-06-19-seo-jsonld-paginas` | MÉDIA | — |
| A11y audit | `2026-06-20-a11y-audit` | MÉDIA | — |
| Testes Vitest unit + Playwright E2E | `2026-06-20-testes-conversao` | BLOQUEANTE (release) | frontend estabilizado |
| Busca de produtos | `2026-06-21-busca-produtos` | MÉDIA (pode ser pós-launch) | — |
| Polish + deploy (PRD update, CI/CD) | `2026-06-21-polish-e-deploy` | BAIXA | tudo anterior |

---

## 4. ADRs relevantes

**ADR-1 — Simulador: link externo, não embed.**
CTAs abrem simulador externo em nova aba (`simulatorUrl` do produto se houver, senão `NEXT_PUBLIC_SIMULATOR_URL` global). Rastrear o clique via evento antes de sair.

**ADR-2 — Analytics via `@next/third-parties` + GTM, com consentimento LGPD.**
Usar `@next/third-parties/google` (não bloqueia LCP). Banner de consentimento mínimo controla o carregamento.

**ADR-3 — Erros/loading como arquivos de convenção do App Router.**
`error.tsx`/`loading.tsx`/`not-found.tsx` por segmento. `error.tsx` é Client Component obrigatório.

**ADR-4 — Mapa via iframe embed estático, não JS API.**
Google Maps por `<iframe>` lazy. `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` opcional na V1.

**ADR-5 — Marca vermelho `#CD3438` é a referência; PRD §5.2 está desatualizado.**
Toda nova UI usa tokens (`--primary`, `--brand*`), nunca hex.

---

## 5. Riscos e questões abertas

1. **URL do simulador:** `simulador.fasesport.com` está ativo? (necessário p/ SPEC 2).
2. **Assets reais:** imagem de hero, og-image final, fotos de produto. Bloqueiam percepção visual, não implementação.
3. **`NEXT_PUBLIC_WHATSAPP_NUMBER` vazio** gera `wa.me/?text=` quebrado. Adicionar guarda.
4. **Busca na V1?** Decisão de produto — cortar para fast-follow e priorizar B1–B4?
5. **Consentimento LGPD:** política de privacidade redigida? Necessária antes de GA4 em produção.
6. Framer Motion já instalado e em uso — garantir `useReducedMotion` consistente em todas as animações novas.
