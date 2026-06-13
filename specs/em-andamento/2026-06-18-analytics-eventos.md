# Analytics GA4 + GTM + Consentimento LGPD + Core Web Vitals

> **Status:** `pendente`
> **ID:** `2026-06-18-analytics-eventos`
> **Criada em:** 2026-06-12
> **Revisada em:** 2026-06-12
> **Agente:** arquiteto

---

## Contexto

Sem analytics, os KPIs do projeto são imensuráveis. Esta spec implementa rastreio completo com GA4 via GTM, consentimento LGPD mínimo e define Core Web Vitals como critérios de aceite de deploy.

**Pré-requisito humano:** política de privacidade redigida e URL definida antes de ativar GA4 em produção.

## Objetivos

- [ ] Instalar e configurar GTM via `@next/third-parties/google` no layout marketing (não raiz)
- [ ] Implementar banner de consentimento LGPD (aceitar/recusar), fixed bottom
- [ ] GTM carrega apenas após consentimento confirmado
- [ ] Leitura de cookie server-side para evitar flash de hidratação
- [ ] Rastrear eventos: `whatsapp_click` (todos os CTAs), `simulator_click`, `lead_submit`, `orcamento_step`
- [ ] Rastrear `page_view` em navegação client-side (SPA)
- [ ] Definir targets de Core Web Vitals como critérios de aceite
- [ ] Persistir preferência de consentimento em cookie (30 dias)

## Fora de escopo

- Dashboard de analytics no CMS admin
- Heatmaps / session recording
- A/B testing
- Eventos de scroll depth (pós-launch)
- Rastreamento no segmento admin

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/(marketing)/layout.tsx` | modificar | Adicionar `<AnalyticsProvider>` e `<ConsentBanner>` — **não** no layout raiz |
| `src/components/analytics/ConsentBanner.tsx` | criar | Banner LGPD fixed bottom, aceitar/recusar, persiste cookie |
| `src/components/analytics/AnalyticsProvider.tsx` | criar | Client Component — recebe `initialConsent` server-side como prop |
| `src/lib/analytics.ts` | criar | `trackEvent(name, params)` com push para `window.dataLayer` + tipagem |
| `src/components/products/SimulatorCta.tsx` | modificar | Adicionar `onClick={() => trackEvent('simulator_click', ...)}` |
| `src/components/products/ProductWhatsAppCta.tsx` | modificar | Adicionar `"use client"` + `trackEvent('whatsapp_click', { location: 'product' })` |
| `src/components/sections/HeroSection.tsx` | modificar | Adicionar `trackEvent('whatsapp_click', { location: 'hero' })` |
| `src/components/ui/WhatsAppFab.tsx` | modificar | Adicionar `trackEvent('whatsapp_click', { location: 'fab' })` |
| `src/components/layout/Footer.tsx` | modificar | Extrair link WhatsApp para sub-componente `"use client"` + `trackEvent('whatsapp_click', { location: 'footer' })` |
| `src/app/(marketing)/[categoria]/page.tsx` | modificar | Adicionar `trackEvent('whatsapp_click', { location: 'category' })` no CTA WhatsApp |
| `src/components/forms/OrcamentoForm.tsx` | modificar | Adicionar `trackEvent('orcamento_step', { step: step + 1 })` e `trackEvent('lead_submit', { sport, source })` |
| `.env.example` | modificar | Adicionar `NEXT_PUBLIC_GTM_ID=` |

### Decisões técnicas

**`(marketing)/layout.tsx`, não raiz:**
O layout raiz envolve tanto o marketing quanto o admin. Banner de consentimento no admin seria incorreto. GTM e `ConsentBanner` vão exclusivamente em `src/app/(marketing)/layout.tsx`.

**Leitura de cookie server-side para evitar flash:**
`AnalyticsProvider` recebe `initialConsent: boolean` como prop, calculado no servidor:

```tsx
// src/app/(marketing)/layout.tsx (Server Component)
import { cookies } from 'next/headers'

export default async function MarketingLayout({ children }) {
  const cookieStore = await cookies()
  const initialConsent = cookieStore.get('fase_analytics_consent')?.value === 'true'

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFab />
      <AnalyticsProvider initialConsent={initialConsent} />
      <ConsentBanner initialConsent={initialConsent} />
    </>
  )
}
```

`AnalyticsProvider` e `ConsentBanner` recebem `initialConsent` — sem hidratação divergente, sem flash.

**`ProductWhatsAppCta.tsx` precisa de `"use client"`:**
Atualmente é Server Component. Para chamar `trackEvent` (que acessa `window.dataLayer`), deve virar Client Component. Adicionar `"use client"` no topo.

**Footer WhatsApp link:**
`Footer.tsx` é Server Component. Não deve virar Client Component inteiro (custo de bundle desnecessário). Extrair apenas o link WhatsApp para um componente `FooterWhatsAppLink.tsx` com `"use client"`.

**`page_view` em SPA (Next.js):**
Next.js usa client-side routing — GTM não detecta mudanças de rota automaticamente. Solução: configurar um trigger de "History Change" no painel GTM apontando para GA4. Alternativamente, criar um componente `RouteChangeTracker.tsx` que usa `usePathname()` do Next.js e empurra `page_view` para o `dataLayer` a cada mudança. **Recomendado:** `RouteChangeTracker` via código para não depender de configuração manual no GTM.

| Arquivo | Ação |
|---|---|
| `src/components/analytics/RouteChangeTracker.tsx` | criar — `"use client"`, `usePathname()`, push `page_view` |

Adicionar `<RouteChangeTracker>` dentro de `AnalyticsProvider` após consentimento.

**Cookie:** `fase_analytics_consent=true|false`, `max-age=2592000` (30 dias), `SameSite=Lax; Path=/`.

**Banner z-index:** `z-[60]` — acima do `WhatsAppFab` que é `z-50`.

### Eventos a rastrear

| Evento | Quando | Parâmetros | Quem chama |
|---|---|---|---|
| `whatsapp_click` | Clique em CTA WhatsApp | `location: 'hero' \| 'product' \| 'category' \| 'fab' \| 'footer'` | HeroSection, ProductWhatsAppCta, categoria page, WhatsAppFab, FooterWhatsAppLink |
| `simulator_click` | Clique no CTA do simulador | `product_slug?: string`, `location: 'product' \| 'category'` | SimulatorCta |
| `orcamento_step` | Avanço de step | `step: 1 \| 2 \| 3` (usar `step + 1` — o form é 0-indexed internamente) | OrcamentoForm |
| `lead_submit` | Submit bem-sucedido | `sport: string`, `source: 'form'` | OrcamentoForm |
| `page_view` | Cada mudança de rota | `page_path: string` | RouteChangeTracker |

### Core Web Vitals — critérios de deploy

| Métrica | Target | Ferramenta |
|---|---|---|
| LCP | < 2.5s | PageSpeed Insights / Vercel Speed Insights |
| CLS | < 0.1 | PageSpeed Insights |
| INP | < 200ms | PageSpeed Insights |

---

## Checklist de Implementação

- [ ] 1. Verificar se `@next/third-parties` já está instalado; instalar se não
- [ ] 2. Criar `src/lib/analytics.ts` com `trackEvent` tipado
- [ ] 3. Criar `src/components/analytics/ConsentBanner.tsx` (UI + lógica de cookie)
- [ ] 4. Criar `src/components/analytics/AnalyticsProvider.tsx` (recebe `initialConsent`, renderiza GTM + RouteChangeTracker)
- [ ] 5. Criar `src/components/analytics/RouteChangeTracker.tsx` (`usePathname` + push `page_view`)
- [ ] 6. Modificar `src/app/(marketing)/layout.tsx`: ler cookie server-side, passar `initialConsent` para `AnalyticsProvider` e `ConsentBanner`
- [ ] 7. Adicionar `"use client"` a `ProductWhatsAppCta.tsx` + `trackEvent`
- [ ] 8. Criar `FooterWhatsAppLink.tsx` como Client Component; substituir link WhatsApp no Footer
- [ ] 9. Adicionar `trackEvent` em `HeroSection`, `WhatsAppFab`, `[categoria]/page.tsx`
- [ ] 10. Adicionar `onClick` + `trackEvent('simulator_click')` em `SimulatorCta.tsx`
- [ ] 11. Adicionar `trackEvent('orcamento_step', { step: step + 1 })` e `trackEvent('lead_submit')` em `OrcamentoForm`
- [ ] 12. Adicionar `NEXT_PUBLIC_GTM_ID=` ao `.env.example`
- [ ] 13. Verificar `tsc --noEmit` limpo

## Critérios de Aceitação

- [ ] Na primeira visita, banner LGPD aparece na parte inferior, acima do WhatsAppFab
- [ ] Sem consentimento: zero requests para `googletagmanager.com` no Network tab
- [ ] Com consentimento: GTM carrega, `window.dataLayer` disponível
- [ ] Clique em botão WhatsApp (em qualquer local) empurra `whatsapp_click` com `location` correto
- [ ] Navegar entre rotas empurra `page_view` para `dataLayer`
- [ ] Submit do formulário empurra `lead_submit`
- [ ] Preferência de consentimento persiste ao recarregar (sem flash de banner na segunda visita)
- [ ] `NEXT_PUBLIC_GTM_ID` ausente: GTM não carregado, sem erro no console
- [ ] Admin (`/admin/*`) **não** exibe banner de consentimento

---

## Notas

- `NEXT_PUBLIC_GTM_ID` é variável pública — vai no bundle client. Não é segredo.
- Política de privacidade deve estar publicada antes de ativar GTM em produção (LGPD art. 18).
- `cookies()` em Next.js 16 retorna Promise — usar `await cookies()`.
- Vercel Speed Insights pode complementar PageSpeed para monitoramento contínuo de CWV.
- Para GTM History Change trigger (alternativa ao `RouteChangeTracker`): GTM → Triggers → New → Trigger Type: History Change → Fire on all history changes. Preferir o componente de código para não depender de configuração manual que pode ser perdida.
