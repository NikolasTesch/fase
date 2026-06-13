# Error / Loading / 404 / Empty States + WhatsApp Guard

> **Status:** `pendente`
> **ID:** `2026-06-17-error-loading-states`
> **Criada em:** 2026-06-12
> **Revisada em:** 2026-06-12
> **Agente:** arquiteto

---

## Contexto

O frontend público não tem nenhuma tela de proteção: ausência de `not-found.tsx`, `error.tsx` e `loading.tsx` faz com que Next.js use fallbacks genéricos sem branding. `buildWhatsAppUrl()` gera `wa.me/?text=` inválido quando `NEXT_PUBLIC_WHATSAPP_NUMBER` está vazio — todos os CTAs da home, categoria, produto e footer ficam quebrados silenciosamente.

**Estado atual dos empty states (verificado no código):**
- `ProductGrid.tsx` — já tem empty state completo. **Não mexer.**
- `CategoriesSection.tsx` — faz `return null` quando vazio. Deve exibir mensagem.
- `TestimonialsSection.tsx` — faz `return null` quando vazio. Pode permanecer assim (seção oculta sem depoimentos é aceitável).

## Objetivos

- [ ] Criar `not-found.tsx` raiz (`src/app/`) com branding Fase Sport + CTA para home
- [ ] Criar `not-found.tsx` no segmento marketing (`src/app/(marketing)/`) — mesma UI, garante layout correto
- [ ] Criar `error.tsx` no segmento marketing (Client Component) com botão de retry
- [ ] Criar `loading.tsx` no segmento marketing com skeleton pulsante
- [ ] Corrigir `buildWhatsAppUrl()` para nunca gerar URL sem número
- [ ] Melhorar empty state de `CategoriesSection`: de `return null` para mensagem com CTA de orçamento

## Fora de escopo

- Empty state do `ProductGrid` (já implementado corretamente)
- `TestimonialsSection` com `return null` (aceitável — seção some quando vazia)
- Páginas de erro customizadas para o admin
- Skeleton granular por componente
- Animações nos estados de erro

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/not-found.tsx` | criar | 404 raiz — cobre rotas fora do segmento marketing |
| `src/app/(marketing)/not-found.tsx` | criar | 404 marketing — usa Navbar/Footer via layout |
| `src/app/(marketing)/error.tsx` | criar | Client Component, props `error` e `reset` |
| `src/app/(marketing)/loading.tsx` | criar | Skeleton pulsante (`animate-pulse`) |
| `src/lib/site.ts` | modificar | Guard em `buildWhatsAppUrl()` |
| `src/components/sections/CategoriesSection.tsx` | modificar | Empty state quando `categories.length === 0` |

### Decisões técnicas

**WhatsApp guard em `buildWhatsAppUrl()`:**
- `NEXT_PUBLIC_WHATSAPP_NUMBER` vazio → em `development`: `console.warn(...)` + retorna `#`; em `production`: retorna `/orcamento`
- Footer (`Footer.tsx:72`) e `WhatsAppFab.tsx` também consomem `buildWhatsAppUrl()` — ambos ficam corrigidos automaticamente pelo fix em `site.ts`. Verificar ambos nos critérios de aceitação.

**Dois `not-found.tsx` necessários:**
- `src/app/not-found.tsx` — raiz, sem layout de marketing (sem Navbar/Footer). Usar layout mínimo inline.
- `src/app/(marketing)/not-found.tsx` — herda o `(marketing)/layout.tsx` e exibe com Navbar/Footer. Rotas marketing que chamam `notFound()` usam este.
- Podem compartilhar o mesmo conteúdo via componente `NotFoundContent` em `src/components/layout/`.

**`error.tsx` obrigatoriamente `"use client"`** (Next.js App Router exige).

**`loading.tsx` e SSG — nota de comportamento:**
O `loading.tsx` no segmento `(marketing)` é um Server Component que atua como Suspense boundary de convenção. Para páginas SSG com `generateStaticParams`, ele só é exibido durante client-side navigation para slugs não pré-gerados (quando `dynamicParams = true`) e durante Suspense de componentes assíncronos. Na prática, a página `/orcamento` é a que mais se beneficia. Para testar: acessar o site com throttling de rede no DevTools e navegar entre rotas.

**Empty state de `CategoriesSection`:**
Quando `categories.length === 0`, renderizar mensagem inline simples — sem componente novo:
```tsx
if (categories.length === 0) {
  return (
    <section id="categorias" className="bg-background py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 text-center">
        <p className="text-muted-foreground">Catálogo em breve. <Link href="/orcamento">Solicite um orçamento personalizado.</Link></p>
      </div>
    </section>
  )
}
```

---

## Checklist de Implementação

- [ ] 1. Corrigir `buildWhatsAppUrl()` em `src/lib/site.ts` com guard + fallback por ambiente
- [ ] 2. Criar componente `NotFoundContent` em `src/components/layout/NotFoundContent.tsx` (conteúdo reutilizável entre os dois `not-found.tsx`)
- [ ] 3. Criar `src/app/not-found.tsx` (raiz) usando `NotFoundContent`
- [ ] 4. Criar `src/app/(marketing)/not-found.tsx` usando `NotFoundContent`
- [ ] 5. Criar `src/app/(marketing)/error.tsx` com `"use client"`, props `{ error, reset }`, botão "Tentar novamente"
- [ ] 6. Criar `src/app/(marketing)/loading.tsx` com skeleton pulsante
- [ ] 7. Melhorar `CategoriesSection` para exibir mensagem quando vazia (em vez de `return null`)
- [ ] 8. Verificar `tsc --noEmit` limpo

## Critérios de Aceitação

- [ ] `/rota-inexistente` renderiza 404 branded com Navbar/Footer
- [ ] Rota fora de `(marketing)` inexistente renderiza 404 mínimo (sem quebrar o layout)
- [ ] Com `NEXT_PUBLIC_WHATSAPP_NUMBER=""`: botão WhatsApp na home, produto, categoria, footer e FAB **não** geram `wa.me/?text=`
- [ ] Em dev, `buildWhatsAppUrl()` com env vazio imprime `console.warn`
- [ ] `error.tsx` renderiza e botão "Tentar novamente" chama `reset()`
- [ ] Home com banco vazio: seção de categorias exibe mensagem (não some silenciosamente)

---

## Notas

- Referência Next.js 16: `error.tsx` recebe `{ error: Error & { digest?: string }, reset: () => void }`.
- `loading.tsx` é Server Component — sem hooks, sem `"use client"`.
- `not-found.tsx` raiz não herda nenhum layout de route group — incluir `<html lang="pt-BR">` e `<body>` se necessário, ou importar layout mínimo.
- Consumidores de `buildWhatsAppUrl()` no projeto: `HeroSection`, `Footer`, `WhatsAppFab`, `ProductWhatsAppCta`, `[categoria]/page.tsx`. Todos ficam cobertos pelo fix em `site.ts`.
