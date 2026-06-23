# Plano de Redesign UI/UX — Fase Sport

> **Versão:** 1.0  
> **Agente:** Arquiteto → Implementador → Revisor  
> **Stack:** Next.js 16 · React 19 · Tailwind CSS 4 · shadcn/ui · Framer Motion 12  
> **Objetivo:** Transformar a aparência do Fase Sport de um template funcional para uma experiência visual marcante e esportiva.

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Tabela de Prioridades e Esforço](#2-tabela-de-prioridades-e-esforço)
3. [Pilar 1 — Identidade Visual & Cor](#3-pilar-1--identidade-visual--cor)
4. [Pilar 2 — Hero & Primeira Dobra](#4-pilar-2--hero--primeira-dobra)
5. [Pilar 3 — Micro-interações & Esportividade](#5-pilar-3--micro-interações--esportividade)
6. [Pilar 4 — Refinamento Visual Geral](#6-pilar-4--refinamento-visual-geral)
7. [ADRs (Architecture Decision Records)](#7-adrs-architecture-decision-records)
8. [Riscos e Considerações](#8-riscos-e-considerações)
9. [Checklist de Verificação](#9-checklist-de-verificação)

---

## 1. Visão Geral

### 1.1 Estado Atual

O Fase Sport tem funcionalidade completa (homepage, categorias, produtos, busca, orçamento multi-step, admin CMS), mas a identidade visual é genérica — parece um template Tailwind/shadcn sem personalidade de marca. A paleta se resume a vermelho + branco + cinza, sem o dourado mencionado no PRD.

### 1.2 Estado Desejado

Um site que **comunique esporte, energia e qualidade** através de:
- Paleta rica e equilibrada (vermelho FASE + dourado + tons neutros sofisticados)
- Hero com impacto visual (vídeo + gradientes animados + formas esportivas)
- Micro-interações que surpreendem e guiam o usuário
- Componentes polidos que parecem de uma marca premium de uniformes
- Admin com visual refinado, não apenas funcional

### 1.3 Princípios de Design (Reafirmados)

| Princípio | Como se aplica |
|---|---|
| **Visual Heavy** | Imagens grandes, gradientes, texturas sutis |
| **Conversão Central** | CTAs destacados com animação, cores contrastantes |
| **Mobile-First** | Tudo testado em 375px, cards em 1 coluna |
| **Velocidade** | Animações performáticas (GPU accelerated), sem reflow |
| **Acessibilidade** | `prefers-reduced-motion` respeitado, contraste WCAG AA |

---

## 2. Tabela de Prioridades e Esforço

| # | Pilar | Prioridade | Esforço | Depende de | Arquivos Afetados |
|---|---|---|---|---|---|
| 1 | Identidade Visual & Cor | 🔴 ALTA | ☕️☕️ | Nenhuma | `globals.css`, ~15 componentes |
| 2 | Hero & Primeira Dobra | 🔴 ALTA | ☕️☕️☕️ | Pilar 1 | `HeroSection.tsx` |
| 3 | Micro-interações | 🟡 MÉDIA | ☕️☕️☕️☕️ | Pilar 1 | ~20 componentes + `AnimatedSection.tsx` |
| 4 | Refinamento Visual Geral | 🟡 MÉDIA | ☕️☕️☕️☕️☕️ | Pilares 1, 3 | ~25 componentes + admin |

**Ordem recomendada:** Pilar 1 → Pilar 2 → Pilar 3 → Pilar 4  
(Pilar 1 é base para todos; Pilar 2 depende de 1; Pilar 3 + 4 independentes entre si mas dependem de 1)

---

## 3. Pilar 1 — Identidade Visual & Cor

### 3.1 Objetivo

Expandir a paleta de cores além do vermelho monocromático, criar um sistema de superfícies com profundidade, e refinar a tipografia para hierarquia mais dramática.

### 3.2 Mudanças por Arquivo

#### `src/app/globals.css` — Novo Design Tokens

**Alterações:**
1. Adicionar `--color-accent` = oklch(0.72 0.175 78.5) /* dourado FASE #E8B500 */
2. Adicionar `--color-sport-blue` = oklch(0.35 0.085 265) /* azul escuro esportivo */
3. Adicionar `--color-sport-green` = oklch(0.55 0.12 155) /* verde campo */
4. Adicionar `--color-surface-alt` = oklch(0.985 0.005 78.5) /* tom quente alternativo */
5. Adicionar `--color-gradient-start`, `--color-gradient-end` tokens para gradientes reutilizáveis
6. Expandir `@theme inline` no Tailwind com:
   ```
   --color-accent: var(--accent);
   --color-sport-blue: var(--sport-blue);
   --color-sport-green: var(--sport-green);
   --color-surface-alt: var(--surface-alt);
   ```
7. Adicionar dark mode para todos os novos tokens
8. Refinar `--radius` de `0.5rem` para `0.625rem` (curvas mais encorpadas)
9. Adicionar keyframes para shimmer/skeleton com a cor da marca

**Efeito visual:** O site ganha uma paleta de 3 acentos (dourado, azul, verde) que podem ser usados em badges, gráficos, hover states, e backgrounds de seção.

#### `src/lib/site.ts` — Expandir constantes de cores (se houver)

**Alterações:**
- Se existirem constantes de cor, atualizar com a nova paleta
- Garantir que o nome do site e meta estejam consistentes

#### `src/components/layout/Navbar.tsx` — Aplicar novos tokens

**Alterações:**
- Substituir `bg-background/95 backdrop-blur` por versão com borda inferior com gradiente sutil
- `hoveredSlug` pill: usar `bg-accent/10` com borda `border-accent/30` em vez de `bg-muted`
- Botão "Orçamento": usar `bg-accent text-accent-foreground` (dourado) no CTA para destacar da navbar

#### `src/components/layout/Footer.tsx` — Footer repaginado

**Alterações:**
- Manter bg-primary mas adicionar `bg-gradient-to-b from-primary to-brand-dark` 
- Links com hover usando cor accent (dourado) em vez de branco
- Adicionar separador decorativo entre seções

#### `src/components/sections/HeroSection.tsx` — Hero repaginado (detalhes no Pilar 2)

**Alterações:** (Ver Pilar 2)

#### `src/components/sections/CtaBannerSection.tsx` — Banner CTA repaginado

**Alterações:**
- Substituir `bg-primary` por `bg-gradient-to-r from-primary via-primary to-brand-dark`
- Adicionar padrão sutil de fundo (linhas diagonais via CSS)
- Botão secondary usar accent (dourado) em vez de secondary padrão

#### `src/components/ui/Button.tsx` — Novas variantes de cor

**Alterações:**
- Adicionar variante `accent`: `bg-accent text-accent-foreground hover:bg-accent/80`
- Adicionar variante `accent-outline`: `border-accent text-accent hover:bg-accent/10`
- Adicionar variante `ghost-accent`: igual ghost mas com hover em accent/10

#### `src/components/products/ProductCard.tsx` — Card refinado

**Alterações:**
- Substituir `rounded-xl border border-border` por `rounded-2xl border border-border/60 shadow-sm`
- Adicionar `hover:shadow-md hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-300`
- Adicionar `ring-1 ring-black/[0.03]` para profundidade
- Badge de tecido: usar bg-accent/10 text-accent-foreground

#### `src/app/globals.css` — Scrollbar personalizada

**Alterações:**
```css
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: var(--muted); }
::-webkit-scrollbar-thumb { background: var(--brand); border-radius: 4px; }
```

### 3.3 ADRs

| Decisão | Opção Escolhida | Motivo |
|---|---|---|
| Formato de cor | OKLCH | Já é o padrão do projeto; melhor para sistema de cores perceptual |
| Como expor novas cores no Tailwind | `@theme inline {}` | Consistente com a configuração existente |
| Dark mode | `prefers-color-scheme` + toggle futuro | Já existe `.dark` no CSS, só ativar |

---

## 4. Pilar 2 — Hero & Primeira Dobra

### 4.1 Objetivo

Transformar o HeroSection de um fundo vermelho estático para uma experiência visual impactante que comunique energia esportiva.

### 4.2 Mudanças por Arquivo

#### `src/components/sections/HeroSection.tsx` — Redesign completo

**Alterações detalhadas:**

1. **Background:** 
   - Substituir `bg-primary` por `bg-gradient-to-br from-primary via-brand-dark to-primary`
   - Adicionar um pseudo-elemento (via CSS) com linhas diagonais estilo campo de futebol: `background-image: repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px)`
   - Manter a imagem de fundo com opacidade 35%, mas adicionar `scale-105` com transição lenta (efeito parallax)

2. **Vídeo opcional:**
   - Integrar `HeroVideo.tsx` conditionalmente: se existir `instagram_hero_video_url`, mostrar vídeo como background em vez de imagem
   - Vídeo com overlay `from-primary/90 via-primary/75 to-brand-dark/85`

3. **Elementos gráficos:**
   - Adicionar 3 círculos decorativos posicionados com `absolute` e `opacity-5` usando `bg-accent` (dourado) — um grande no canto superior direito, um médio no centro, um pequeno flutuando
   - Adicionar linhas diagonais animadas com Framer Motion (opacidade 0 → 0.08) que se movem lentamente

4. **Tipografia:**
   - H1: aumentar para `text-6xl lg:text-8xl` com `tracking-tight`
   - Adicionar `text-shadow` sutil: `drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]`
   - Badge "Personalização Total" acima do H1: `bg-accent/20 text-accent border border-accent/30 rounded-full px-4 py-1 text-sm font-semibold`

5. **CTAs:**
   - Botão "Chamar no WhatsApp": mudar para `variant="accent"` (dourado) para destacar
   - Botão "Ver Catálogo": manter outline mas com `border-white/30 hover:bg-white/10`
   - Adicionar seta animada no botão WhatsApp (lucide `ArrowRight` com animação slide)
   - Badge "Grátis" ou "Sem custo" no CTA (opcional)

6. **Animações:**
   - Stagger mais elaborado: badge → H1 → parágrafo → CTAs (delays: 0, 0.15, 0.3, 0.45)
   - Cada elemento com `y: 40 → 0` + `opacity: 0 → 1` usando `ease: [0.16, 1, 0.3, 1]`
   - Adicionar mouse-follow parallax sutil no background (via `onMouseMove`)

### 4.3 ADRs

| Decisão | Opção Escolhida | Motivo |
|---|---|---|
| Vídeo vs imagem estática | Condicional: vídeo se disponível, senão imagem | Já existe suporte a vídeo; fallback seguro |
| Como implementar parallax | Framer Motion `useScroll` + `useTransform` | Já usamos Framer; sem dependência extra |
| Formas geométricas | CSS puro + elementos div absolut posicionados | Zero custo de performance, máximo de controle |

---

## 5. Pilar 3 — Micro-interações & Esportividade

### 5.1 Objetivo

Adicionar camadas de interação que tornem a navegação no site uma experiência prazerosa e memorável.

### 5.2 Mudanças por Arquivo

#### `src/components/ui/AnimatedSection.tsx` — Animações avançadas

**Alterações:**
- `containerVariants`: adicionar diferentes direções por índice ímpar/par
- Novo componente `FadeInWhenVisible` com 4 direções: `up`, `down`, `left`, `right`
- Novo componente `ScaleInWhenVisible` para cards (escala 0.95 → 1 com opacidade)
- Novo componente `SlideInStagger` com direção alternada por índice filho

```tsx
// Novos pattern variants
const itemVariantsDirectional = (dir: 'left' | 'right' | 'up' | 'down') => ({
  hidden: { 
    opacity: 0, 
    x: dir === 'left' ? -30 : dir === 'right' ? 30 : 0,
    y: dir === 'up' ? 30 : dir === 'down' ? -30 : 0,
  },
  show: { opacity: 1, x: 0, y: 0, transition: { duration: 0.45, ease } },
});
```

#### `src/components/sections/RevealOnScroll.tsx` — Mais opções de animação

**Alterações:**
- Aceitar prop `direction: 'up' | 'down' | 'left' | 'right'` (padrão 'up')
- Aceitar prop `distance: number` (padrão 24)
- Aceitar prop `scale` para efeito de escala
- Aceitar prop `duration` para controle de velocidade

#### `src/components/products/ProductCard.tsx` — Card interativo

**Alterações:**
- Adicionar overlay no hover com botão "Ver Detalhes" aparecendo
- Imagem com `scale-105` no hover (já existe, manter)
- Card com `shadow-sm` → `shadow-lg` + `-translate-y-1` no hover
- Borda com `transition-colors duration-300` para `border-primary` (já existe, refinar cor)

#### `src/components/categories/CategoryCard.tsx` — Categoria interativa

**Alterações:** (Ver arquivo real - ler primeiro)
- Adicionar hover com gradiente overlay
- Nome da categoria com slide-up no hover

#### `src/components/products/ProductGrid.tsx` — Grid com stagger

**Alterações:**
- Envolver grid em `StaggerContainer`
- Cada `ProductCard` como `StaggerItem`
- Delay de 0.05 entre cards

#### `src/components/ui/WhatsAppFab.tsx` — FAB com atenção

**Alterações:**
- Adicionar animação de pulsar sutil (keyframes `pulse-whatsapp`):
  ```css
  @keyframes pulse-whatsapp {
    0%, 100% { box-shadow: 0 0 0 0 rgba(205,52,56,0.4); }
    50% { box-shadow: 0 0 0 12px rgba(205,52,56,0); }
  }
  ```
- Pulsar apenas nos primeiros 10 segundos após carregar a página, depois parar
- Tooltip "Fale conosco!" que aparece 3 segundos após carregar

#### `src/components/ui/button.tsx` — Botões com micro-interação

**Alterações:**
- Adicionar `active:scale-[0.97]` (já existe parcial)
- Adicionar transição de `letter-spacing` no hover para CTAs principais
- Variante `accent` com glow sutil no hover

#### `src/components/sections/ProcessSteps.tsx` — Steps com progresso

**Alterações:**
- Adicionar linha conectora SVG entre os steps (em vez do `▶` feio)
- Cada step: animar ícone com `scale: 0.8 → 1` ao entrar no viewport
- Step número com transição de cor (mantendo padrão existente)

#### `src/components/sections/TestimonialsCarousel.tsx` — Transição suave

**Alterações:**
- Já está bom com AnimatePresence. Adicionar:
- Efeito de fade + slide mais suave (reduzir duração para 0.25s)
- Indicadores (dots) com animação de preenchimento

#### `src/app/(marketing)/loading.tsx` — Skeleton personalizado

**Alterações:**
- Criar skeleton com gradiente animado na cor da marca (shimmer)
- Usar `--brand` + `--brand-tint` alternados
- Adicionar logo FASE pulsando suavemente

### 5.3 ADRs

| Decisão | Opção Escolhida | Motivo |
|---|---|---|
| Animação de botão | CSS transitions + classes | 60fps garantido, sem dependência de JS |
| Stagger de grid | Framer Motion `staggerChildren` | Já existe em `AnimatedSection.tsx` |
| Pulsar WhatsApp | CSS `@keyframes` com `animation-delay` | Não precisa de JS, performático |
| Skeleton | CSS shimmer (pseudo-elemento) | Sem lib extra, reutilizável |

---

## 6. Pilar 4 — Refinamento Visual Geral

### 6.1 Objetivo

Polir cada componente individualmente: desde cards de produto até o admin, elevando o padrão visual de todos os elementos.

### 6.2 Mudanças por Arquivo

#### `src/components/products/ProductCard.tsx` — Card completo

**Alterações (cumulativas com Pilar 3):**
- Badge de tecido estilizado: `bg-accent/10 text-accent border border-accent/20 rounded-full px-2.5 py-0.5 text-xs font-semibold`
- Preço "Sob consulta" estilizado abaixo do nome: `text-sm text-muted-foreground italic`
- "Ver Detalhes" com seta animada no hover
- Se imagem estiver faltando, mostrar placeholder com gradiente em vez de `Shirt` ícone

#### `src/components/sections/FeaturedSection.tsx` — Destaques refinados

**Alterações:**
- Adicionar gradiente sutil nos cards em destaque
- Borda com `ring-1 ring-black/[0.03]` para profundidade

#### `src/components/sections/CategoriesSection.tsx` — Categorias refinadas

**Alterações:**
- `ModalitySectionBlock`: imagem com gradiente overlay `from-transparent via-transparent to-primary/20`
- Botões de navegação (setas) com fundo `bg-background/90 backdrop-blur-sm` e borda
- Indicadores de página com cor accent para o ativo
- Links de catálogo com `border-accent/30 hover:bg-accent/10`

#### `src/components/sections/InstagramSection.tsx` — Grid refinado

**Alterações:**
- Grid com gap maior (`gap-4`)
- Overlay no hover mais suave: `bg-gradient-to-t from-black/50 via-black/10 to-transparent`
- Nome do post com slide-up + fade
- Adicionar ícone do Instagram no canto superior direito

#### `src/components/sections/HowItWorksSection.tsx` + `ProcessSteps.tsx`

**Alterações:**
- Substituir `▶` por SVG connector (`path` com stroke-dasharray animado)
- Cards com `hover:shadow-md hover:-translate-y-0.5`
- Números em `font-heading text-4xl` com cor accent/30

#### `src/components/sections/WhySection.tsx` — Diferenciais polidos

**Alterações:**
- Já está bom. Pequenos ajustes:
- Ícones com gradiente (accent + primary) em vez de cor sólida
- Cards com `ring-1 ring-black/[0.03]`

#### `src/components/sections/ContactSection.tsx` — Contato refinado

**Alterações:**
- Cards de informações de contato com hover sutil (`hover:bg-accent/5`)
- Ícones com fundo gradiente (primary → accent)
- Mapa com `rounded-2xl` e `shadow-lg` mais pronunciado

#### `src/components/forms/OrcamentoForm.tsx` — Form refinado

**Alterações:**
- Progresso visual: substituir bolinhas por "pill steps" com label e número:
  - Step completed: `bg-accent text-accent-foreground` (dourado)
  - Step active: `ring-2 ring-accent bg-background`
  - Step pending: `bg-muted text-muted-foreground`
- Conector entre steps: linha com gradiente
- Inputs com `focus:border-accent focus:ring-accent/20`
- Botão "Próximo" com bg-accent e seta animada
- Estado de sucesso: ícone de check verde animado + confete sutil (CSS)

#### `src/components/products/ProductGallery.tsx` — Galeria refinada

**Alterações:**
- Thumbnails com borda `border-2 border-transparent` que fica `border-accent` quando ativa
- Transição de imagem com cross-fade (Framer Motion AnimatePresence)

#### `src/components/layout/Breadcrumb.tsx` — Breadcrumb refinado

**Alterações:**
- Separador maior e mais claro
- Link ativo com cor accent
- Fonte menor com letter-spacing

#### Admin — `src/app/(admin)/`

**Alterações:**

**`layout.tsx`:**
- Sidebar com `bg-card` substituído por `bg-gradient-to-b from-background to-muted/50`
- Logo com badge "Admin" refinado (fundo accent)
- Borda da sidebar com `border-r border-border/60`

**`admin/dashboard/page.tsx`:**
- Cards do dashboard com `shadow-sm hover:shadow-md` e borda accent no hover
- Grid de ações rápidas com hover mais expressivo
- Título com decoração (linha accent)

**`admin/dashboard/_components/DashboardCards.tsx`:**
- Cada card com ícone colorido (accent, primary, sport-blue, sport-green alternados)
- Valor numérico em `font-heading text-3xl`

**`admin/produtos/_components/AnimatedTableRows.tsx`:**
- Linhas com hover accent/5
- Status toggle com cor accent para "ativo"

**Tabelas em geral (admin):**
- Header da tabela com `bg-muted/50` e `text-xs font-semibold uppercase tracking-wider`
- Linhas alternadas com `even:bg-muted/20`

#### `src/components/ui/WhatsAppFab.tsx` — FAB refinado

**Alterações:**
- Fundo com gradiente (primary → brand-dark) em vez de cor sólida
- Sombra mais pronunciada: `shadow-lg hover:shadow-xl`
- Tooltip com fundo accent

### 6.3 ADRs

| Decisão | Opção Escolhida | Motivo |
|---|---|---|
| Gradientes de fundo | CSS `linear-gradient` / `radial-gradient` | Zero JS, GPU acelerado |
| Elevação de cards | `box-shadow` + `translateY` | Mais natural que scale |
| Conector SVG | Inline SVG + `stroke-dasharray` animation | Leve, responsivo, animável |
| Admin visual | Mesmo design system do frontend | Consistência, sem desvio |

---

## 7. ADRs (Architecture Decision Records)

### ADR-001: Uso de OKLCH para cores

**Contexto:** Precisamos expandir a paleta mantendo consistência perceptual.
**Decisão:** Manter OKLCH (já é o padrão do projeto). OKLCH permite criar variações previsíveis de luminosidade e saturação.
**Consequência:** Todas as novas cores serão definidas em OKLCH.

### ADR-002: Animação via CSS vs Framer Motion

**Contexto:** Micro-interações podem ser implementadas com CSS puro ou Framer Motion.
**Decisão:** 
- Hovers, transitions, keyframes simples → CSS puro (60fps garantido, sem JS)
- Scroll-triggered, stagger, layout animations → Framer Motion (já instalado, padrão do projeto)
- Skeleton shimmer → CSS pseudo-elemento (leve, reutilizável)

### ADR-003: Vídeo no Hero

**Contexto:** HeroSection pode usar vídeo como background.
**Decisão:** Condicional — se o admin configurar `instagram_hero_video_url`, usar como vídeo background; senão, manter imagem estática.
**Implementação:** Extrair lógica de `HeroVideo.tsx` para hook `useVideoBackground()` que retorna URL ou null.
**Fallback:** Imagem estática + gradiente sempre presentes como camada inferior.

### ADR-004: Dark mode

**Contexto:** O CSS já tem variáveis `.dark` definidas, mas não há toggle.
**Decisão:** Ativar dark mode automaticamente via `@media (prefers-color-scheme: dark)`. Sem toggle manual na V1.
**Futuro:** Adicionar toggle na navbar (V2), com estado persistido em localStorage.
**Implementação:** Adicionar `@media (prefers-color-scheme: dark) { :root { ... } }` ou usar `class: dark` via JS.

### ADR-005: Gradientes nos cards

**Contexto:** Cards do admin podem usar glassmorphism.
**Decisão:** Usar `backdrop-blur` + `bg-background/80` já existente no projeto. Glassmorphism completo (fundo translúcido) apenas no admin dashboard cards, não nos cards de produto (para manter legibilidade das imagens).

### ADR-006: Badge de tecido no ProductCard

**Contexto:** O tecido (dry-fit, poliéster) é informação de venda.
**Decisão:** Badge com cor accent (dourado) em vez de primary (vermelho) para não competir com a imagem do produto.

---

## 8. Riscos e Considerações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Mudanças de cor quebram contraste WCAG | Baixa | Alto | Verificar contraste de cada novo token contra foreground |
| Animações excessivas causam CLS | Média | Médio | Usar `transform` e `opacity` apenas, nunca `width/height/top/left` |
| Vídeo no Hero aumenta LCP | Média | Alto | Usar `preload="none"` + poster image; vídeo começa após interação |
| Usuários com `prefers-reduced-motion` perdem interações | Baixa | Baixo | `useReducedMotion()` já implementado em todos os componentes |
| Admin com glassmorphism pode ficar pesado | Baixa | Baixo | Usar backdrop-blur apenas em 1-2 cards, não no layout todo |
| Regressão visual em testes E2E | Média | Médio | Atualizar seletores nos testes se classes mudarem |

---

## 9. Checklist de Verificação

### Pilar 1 — Identidade Visual
- [ ] `globals.css` com paleta expandida (accent, sport-blue, sport-green)
- [ ] `@theme inline` no Tailwind com novos tokens
- [ ] Navbar com CTA dourado e hover refinado
- [ ] Footer com gradiente e links accent
- [ ] CtaBannerSection com gradiente
- [ ] Button com variante `accent` e `accent-outline`
- [ ] ProductCard com borda refinada e badge accent
- [ ] Dark mode ativo via `prefers-color-scheme`
- [ ] Scrollbar customizada com brand color

### Pilar 2 — Hero & Primeira Dobra
- [ ] Hero com gradiente animado e textura esportiva
- [ ] Badge "Personalização Total" acima do H1
- [ ] Vídeo background condicional (se disponível)
- [ ] Círculos decorativos dourados
- [ ] Parallax sutil no scroll
- [ ] CTAs com accent (dourado) + seta animada
- [ ] Acessibilidade: `prefers-reduced-motion` respeitado

### Pilar 3 — Micro-interações
- [ ] `AnimatedSection.tsx` com direções alternadas (left/right/up)
- [ ] `RevealOnScroll` com props de direção e distância
- [ ] ProductCard com hover elevado (shadow + translateY)
- [ ] WhatsApp FAB com pulsar inicial e tooltip
- [ ] Button com active:scale e hover letter-spacing
- [ ] ProcessSteps com conector SVG animado
- [ ] Skeleton loading com shimmer da marca
- [ ] Testimonials com transição suave

### Pilar 4 — Refinamento
- [ ] ProductCard com badge de tecido estilizado e placeholder
- [ ] CategoriesSection com gradiente overlay e navegação refinada
- [ ] InstagramSection com grid polido e ícone
- [ ] ProcessSteps com cards elevados e conector SVG
- [ ] WhySection com ícones gradiente
- [ ] ContactSection com hover nos contatos
- [ ] OrcamentoForm com pill steps e inputs accent
- [ ] ProductGallery com thumbnail accent
- [ ] Breadcrumb refinado
- [ ] Admin sidebar com gradiente e logo refinado
- [ ] Admin dashboard cards com ícones coloridos
- [ ] Admin tabelas com header estilizado
- [ ] Admin ações rápidas com hover polish

### Geral
- [ ] `lsp_diagnostics` limpo em todos os arquivos modificados
- [ ] `npm run build` passa
- [ ] `npm run type-check` passa
- [ ] `npm run lint` passa
- [ ] Testes E2E continuam passando (Fluxo A e B)
- [ ] Responsividade 375px mantida
- [ ] `prefers-reduced-motion` respeitado
