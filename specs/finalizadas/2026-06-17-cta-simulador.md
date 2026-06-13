# CTA Simulador de Uniformes

> **Status:** `pendente`
> **ID:** `2026-06-17-cta-simulador`
> **Criada em:** 2026-06-12
> **Revisada em:** 2026-06-12
> **Agente:** arquiteto

---

## Contexto

O schema Prisma tem `simulatorUrl` em `Product`, mas nunca é selecionado nas queries nem renderizado. O PRD §4.1 classifica o Fluxo A (simulador) como prioridade ALTA. `NEXT_PUBLIC_SIMULATOR_URL` existe no `.env` mas não é consumida. URL `simulador.fasesport.com` confirmada ativa.

O evento de clique (`simulator_click`) **não** será rastreado nesta spec — analytics entra em `2026-06-18-analytics-eventos`. Para facilitar essa adição posterior **sem nova refatoração**, o CTA já é criado como componente Client separado (`SimulatorCta.tsx`). A spec de analytics só precisará adicionar o `onClick` nele.

## Objetivos

- [ ] Criar `SimulatorCta.tsx` como Client Component isolado (sem tracking ainda)
- [ ] Selecionar `simulatorUrl` na query da página de produto
- [ ] Renderizar `SimulatorCta` na página de produto quando URL disponível
- [ ] Usar `NEXT_PUBLIC_SIMULATOR_URL` como fallback global quando produto não tem URL própria
- [ ] CTA abre em nova aba com `target="_blank" rel="noopener noreferrer"`
- [ ] CTA presente na página de categoria (usando URL global como fallback)
- [ ] Adicionar `NEXT_PUBLIC_SIMULATOR_URL` ao `.env.example`

## Fora de escopo

- Tracking analytics do clique (spec `2026-06-18-analytics-eventos`)
- Embed do simulador inline na página
- CTA do simulador na homepage / hero (fora de escopo desta spec — homepage terá spec própria)
- Mudanças no CMS admin (campo já existe no schema)

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/components/products/SimulatorCta.tsx` | criar | Client Component: botão "Simular uniforme" — recebe `url: string` como prop |
| `src/lib/site.ts` | modificar | Adicionar helper `getSimulatorUrl(productUrl?)` |
| `src/app/(marketing)/[categoria]/[produto]/page.tsx` | modificar | Selecionar `simulatorUrl`, calcular URL, passar para `SimulatorCta` |
| `src/app/(marketing)/[categoria]/page.tsx` | modificar | Adicionar CTA de simulador global na seção inferior |
| `.env.example` | modificar | Adicionar `NEXT_PUBLIC_SIMULATOR_URL=` |

### Por que `SimulatorCta.tsx` como Client Component separado

`produto/page.tsx` é Server Component. O CTA precisa de `onClick` para rastreamento (spec de analytics). Em vez de converter a página inteira ou criar um wrapper genérico depois, esta spec já extrai o botão como Client Component. A spec de analytics apenas adicionará `onClick={() => trackEvent('simulator_click', ...)}` no componente existente — sem refatoração.

### Lógica de resolução da URL em `getSimulatorUrl`

```ts
export function getSimulatorUrl(productUrl?: string | null): string | null {
  if (productUrl) return productUrl
  const global = process.env.NEXT_PUBLIC_SIMULATOR_URL
  return global && global.length > 0 ? global : null
}
```

Se retornar `null`, `SimulatorCta` não é renderizado — sem elemento vazio ou botão quebrado.

### `SimulatorCta.tsx` — estrutura

```tsx
"use client"

interface SimulatorCtaProps {
  url: string
}

export function SimulatorCta({ url }: SimulatorCtaProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="simulator-cta"
      className="..."
    >
      Simular uniforme →
    </a>
  )
}
```

`onClick` será adicionado pela spec de analytics sem necessidade de reabrí-la.

### Posicionamento na página de produto

```
[Galeria]  |  [Nome do produto]
           |  [Badges: tecido, qtd mínima]
           |  [Descrição]
           |  [Chamar no WhatsApp]  [Solicitar Orçamento]   ← ações primárias
           |  [Simular uniforme →]                           ← ação terciária, abaixo
```

### Posicionamento na página de categoria

No bloco de CTA inferior existente, após os dois botões principais, como link-texto ou botão ghost:
```
[Solicitar Orçamento]  [Chamar no WhatsApp]
[Ou simule o uniforme online →]   ← novo, data-testid="simulator-cta-category"
```

---

## Checklist de Implementação

- [ ] 1. Criar helper `getSimulatorUrl()` em `src/lib/site.ts`
- [ ] 2. Criar `src/components/products/SimulatorCta.tsx` como Client Component
- [ ] 3. Adicionar `simulatorUrl: true` ao `select` da query principal em `produto/page.tsx`
- [ ] 4. Calcular URL com `getSimulatorUrl(product.simulatorUrl)` e renderizar `<SimulatorCta>` condicionalmente
- [ ] 5. Adicionar `<SimulatorCta>` na seção de CTA da `[categoria]/page.tsx` com URL global
- [ ] 6. Verificar que sem URLs configuradas o CTA não aparece (nenhum elemento vazio)
- [ ] 7. Adicionar `NEXT_PUBLIC_SIMULATOR_URL=` ao `.env.example`
- [ ] 8. Verificar `tsc --noEmit` limpo

## Critérios de Aceitação

- [ ] Produto com `simulatorUrl`: botão aparece e abre URL correta em nova aba
- [ ] Produto sem `simulatorUrl` + `NEXT_PUBLIC_SIMULATOR_URL` definido: botão usa URL global
- [ ] Sem nenhuma URL configurada: botão não aparece
- [ ] Página de categoria tem CTA de simulador visível
- [ ] `data-testid="simulator-cta"` presente no botão do produto
- [ ] `data-testid="simulator-cta-category"` presente no CTA da categoria

---

## Notas

- `simulatorUrl` já existe no schema Prisma — não requer migration.
- `SimulatorCta.tsx` precisa ser `"use client"` agora mesmo que ainda não tenha `onClick`, pois a spec de analytics adicionará `trackEvent` (que usa `window`) sem nova refatoração.
- `generateStaticParams` em `produto/page.tsx` não precisa selecionar `simulatorUrl` — apenas a query da página.
- A spec de analytics adicionará `onClick` ao `SimulatorCta` existente; não reabrirá esta spec.
