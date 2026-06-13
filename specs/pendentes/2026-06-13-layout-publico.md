# Layout Público — Navbar, Footer e grupo (marketing)

> **Status:** `pendente`
> **ID:** `2026-06-13-layout-publico`
> **Criada em:** 2026-06-12
> **Agente:** arquiteto

---

## Contexto

O site público não tem casca: não existem Navbar, Footer nem `(marketing)/layout.tsx`. Hoje apenas `src/app/(marketing)/orcamento/page.tsx` vive no grupo `(marketing)`, mas sem layout próprio ele só herda o `RootLayout` (html/body), ficando sem navegação e sem rodapé. Toda página pública futura (homepage, categoria, produto, como-funciona) depende dessa casca compartilhada com os CTAs de conversão (WhatsApp + Orçamento). É a fundação das specs seguintes.

## Objetivos

- [ ] Criar `Navbar` sticky com logo, links de categoria, CTA "Orçamento" e menu hamburguer mobile animado
- [ ] Criar `Footer` com logo branco, colunas (Categorias / Links Úteis / Contato) e dados da loja (Colatina-ES)
- [ ] Criar `WhatsAppFab` flutuante (visível principalmente em mobile) lendo `NEXT_PUBLIC_WHATSAPP_NUMBER`
- [ ] Criar `src/app/(marketing)/layout.tsx` que envolve Navbar + `{children}` + Footer + WhatsAppFab
- [ ] Centralizar a constante de links de categoria e a montagem da URL do WhatsApp em `src/lib`

## Fora de escopo

- Homepage e suas seções (spec `2026-06-13-homepage`)
- Páginas de categoria/produto/como-funciona
- Schema.org / metadata global (spec `2026-06-16-seo-e-metadata`)
- Busca de produtos no header

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/lib/site.ts` | criar | Constantes compartilhadas: `CATEGORY_NAV` (slug + label das 6 categorias da navbar), `SITE_CONTACT` (whatsapp, endereço, e-mail, cidade), `buildWhatsAppUrl(message?)` |
| `src/components/layout/Navbar.tsx` | criar | Server Component. Sticky no topo. Logo (`/logo.svg` via `next/image`), links de categoria (`next/link`), `<Button>` "Orçamento" → `/orcamento`. Renderiza `<MobileMenu>` para o toggle |
| `src/components/layout/MobileMenu.tsx` | criar | `"use client"`. Botão hamburguer (`Menu`/`X` do lucide), painel com `AnimatePresence` + `useReducedMotion`. `data-testid="mobile-menu-button"` |
| `src/components/layout/Footer.tsx` | criar | Server Component. Logo branco (`/logo-white.svg`), 3 colunas, contato e endereço Colatina-ES |
| `src/components/ui/WhatsAppFab.tsx` | criar | `"use client"`. FAB fixo bottom-right, ícone `MessageCircle` lucide, `href` de `buildWhatsAppUrl()`. `data-testid="whatsapp-fab"` |
| `src/app/(marketing)/layout.tsx` | criar | Server Component. `<Navbar/>` + `<main className="flex-1">{children}</main>` + `<Footer/>` + `<WhatsAppFab/>` |
| `src/app/page.tsx` | deletar | Boilerplate; a homepage passa a ser `(marketing)/page.tsx` (ver spec homepage) para herdar esta casca |

### Decisões técnicas (ADR)

**Por que mover a homepage para `(marketing)/`.** Layouts de _route group_ só envolvem rotas dentro do grupo. Uma `src/app/page.tsx` na raiz **não** herdaria `(marketing)/layout.tsx`, ficando sem Navbar/Footer. Em vez de duplicar a casca no root layout, padronizamos todas as páginas públicas dentro de `(marketing)/`. Esta spec apenas deleta o boilerplate; a criação de `(marketing)/page.tsx` é da spec homepage.

**Navbar como Server Component com ilha cliente.** A navbar é majoritariamente estática (links). Apenas o menu mobile precisa de estado/animação, então isolamos em `MobileMenu` (`"use client"`), mantendo a navbar fora do bundle cliente.

**`<Button>` usa `render`, não `asChild`.** O `Button` (`src/components/ui/button.tsx`) é baseado em `@base-ui/react`, que usa a prop **`render`** (ex.: `render={<Link href="/orcamento" />}`) e **não** `asChild` (padrão Radix). Todas as specs devem usar `render` ao fazer `<Button>` virar link.

**WhatsApp number via env.** `NEXT_PUBLIC_WHATSAPP_NUMBER` é `NEXT_PUBLIC_`, legível em Client Components. `buildWhatsAppUrl` monta `https://wa.me/${number}?text=${encodeURIComponent(msg)}`; mensagem padrão: `"Olá Fase Sport! Gostaria de solicitar um orçamento."`.

---

## Checklist de Implementação

- [ ] 1. Criar `src/lib/site.ts` com `CATEGORY_NAV` (futebol, volei, basquete, handebol, passeio, agasalho), `SITE_CONTACT` e `buildWhatsAppUrl(message?: string)`
- [ ] 2. Criar `src/components/layout/MobileMenu.tsx` (`"use client"`): estado `open`, botão `Menu`/`X`, painel `AnimatePresence`, `useReducedMotion`, fecha ao navegar, `data-testid="mobile-menu-button"`
- [ ] 3. Criar `src/components/layout/Navbar.tsx`: header sticky, `next/image` logo, links de `CATEGORY_NAV`, `<Button render={<Link href="/orcamento" />}>Orçamento</Button>`, `<MobileMenu>` visível só em `< md`
- [ ] 4. Criar `src/components/layout/Footer.tsx`: logo branco, colunas Categorias (de `CATEGORY_NAV`) / Links Úteis (Como Funciona, Orçamento) / Contato (`SITE_CONTACT`)
- [ ] 5. Criar `src/components/ui/WhatsAppFab.tsx` (`"use client"`): link fixo `buildWhatsAppUrl()`, ícone `MessageCircle`, `aria-label="Falar no WhatsApp"`, `data-testid="whatsapp-fab"`
- [ ] 6. Criar `src/app/(marketing)/layout.tsx` montando Navbar + main + Footer + WhatsAppFab
- [ ] 7. Deletar `src/app/page.tsx` (boilerplate)

## Critérios de Aceitação

- [ ] Em qualquer rota dentro de `(marketing)`, Navbar e Footer aparecem sem código duplicado por página
- [ ] Em viewport 375px, o botão hamburguer (`mobile-menu-button`) aparece e os links inline somem; clicar abre o painel animado; com `prefers-reduced-motion` a animação é suprimida
- [ ] O FAB do WhatsApp (`whatsapp-fab`) é visível e seu `href` casa com `/^https:\/\/wa\.me\//`
- [ ] CTA "Orçamento" da navbar navega para `/orcamento`
- [ ] Nenhuma cor hardcoded (`bg-blue-*`, hex, etc.); apenas tokens do design system
- [ ] `npx tsc --noEmit` sem erros nos arquivos novos

---

## Notas

- Logos disponíveis: `public/logo.svg` e `public/logo-white.svg`.
- Confirmar nomes de ícones em `lucide-react@^1.17.0` (`Menu`, `X`, `MessageCircle`) antes de usar.
- `CATEGORY_NAV` da navbar é o subconjunto de 6 itens. O grid completo da homepage (8 itens, inclui colete/acessórios) vem do banco — não confundir as duas fontes.
