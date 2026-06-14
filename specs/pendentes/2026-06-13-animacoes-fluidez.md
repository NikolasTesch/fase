# Design/UX: Melhoria de Animações e Fluidez do Portal (Framer Motion)

> **Status:** `pendente`
> **ID:** `2026-06-13-animacoes-fluidez`
> **Criada em:** 2026-06-13
> **Agente:** arquiteto

---

## Contexto

Embora o portal utilize Framer Motion para revelar seções ao rolar a página (`RevealOnScroll.tsx` e `AnimatedSection.tsx`), elementos interativos críticos como a barra de navegação (Navbar), botões, cartões de produtos e transições de páginas ainda funcionam de forma estática ou com transições CSS instantâneas simples.

Para criar uma experiência moderna de alto padrão visual, adicionaremos micro-animações inteligentes e fluidas que guiam o usuário durante a navegação. Essas melhorias focarão na interatividade da Navbar, transições de páginas, interações de hover em cards/botões e abertura de menus suspensos, respeitando rigorosamente as diretrizes de acessibilidade (redução de movimento).

---

## Objetivos

- [ ] Implementar animações premium na **Navbar (`Navbar.tsx`)**:
  - **Mount Animation:** Deslizar e esmaecer a barra de navegação ao carregar a página (de `y: -20` com `opacity: 0` para `y: 0` e `opacity: 1`).
  - **Scroll Transition (Sticky Shrink):** Detectar rolagem de tela (`y > 20`) para encolher a altura da Navbar de `h-16` para `h-14` com transição suave, adicionando sombreado sutil e efeito de desfoque de fundo mais visível.
  - **Hover Pill/Underline:** Adicionar um indicador sob os links de navegação que desliza de forma fluida de um link para o outro ao passar o mouse (`hover`) usando o recurso `layoutId` do Framer Motion.
  - **Animated Dropdown:** Utilizar `AnimatePresence` e `motion.div` para abrir e fechar o dropdown "Empresarial" com efeito de escala e desvanecimento suave.
- [ ] Implementar transições de página fluidas:
  - Criar um wrapper ou modificar o layout principal para aplicar uma animação suave de fade-in/slide-up nas mudanças de rota do App Router.
- [ ] Adicionar micro-interações de Hover e Clique em elementos clicáveis:
  - **Botões (`button.tsx`):** Efeito tátil de encolhimento sob clique/toque via CSS Tailwind (`active:scale-[.98] transition-transform duration-150`). Framer Motion **não** deve ser usado no `Button` porque ele usa `render` prop do `@base-ui/react` que é incompatível com `motion.button`.
  - **Cards de Produto (`ProductCard.tsx`) e Categorias (`CategoryCard.tsx`):** Elevação suave do card no eixo Y (`y: -6px`) acompanhado de zoom interno na imagem principal (`scale: 1.06`) com cantos arredondados contidos (`overflow-hidden`).
- [ ] Garantir que todas as novas interações respeitem a flag `useReducedMotion()`.

---

## Fora de escopo

- Transições complexas baseadas em coordenadas ou 3D que possam impactar negativamente a performance de renderização no celular (mantendo foco em transições baseadas em opacidade e translações 2D leves).

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/components/layout/Navbar.tsx` | modificar | Converter para `"use client"`, monitorar estado de scroll e adicionar animações de montagem, encolhimento, hover indicator e transição de dropdown. |
| `src/components/ui/button.tsx` | modificar | Adicionar `active:scale-[.98] transition-transform duration-150` via Tailwind CSS. Não usar `motion.button` — incompatível com o `render` prop do Base UI. |
| `src/components/products/ProductCard.tsx` | modificar | Converter para `"use client"` se necessário e adicionar animação de elevação de card e zoom de imagem. |
| `src/components/categories/CategoryCard.tsx` | modificar | Converter para `"use client"` e adicionar animação de elevação de card e zoom de imagem. |
| `src/app/(marketing)/layout.tsx` | modificar | Adicionar transição de página no container principal para suavizar a troca de rotas. |

### Hover Indicator na Navbar

Utilizaremos o `layoutId` do Framer Motion para criar uma pílula deslizante de background que acompanha o cursor de link em link:

```tsx
const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

// No mapeamento dos links da Navbar:
<Link
  key={item.slug}
  href={`/${item.slug}`}
  onMouseEnter={() => setHoveredSlug(item.slug)}
  onMouseLeave={() => setHoveredSlug(null)}
  className="relative rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors"
>
  <span className="relative z-10">{item.label}</span>
  {hoveredSlug === item.slug && (
    <motion.span
      layoutId="nav-hover-pill"
      className="absolute inset-0 -z-10 rounded-lg bg-muted"
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
    />
  )}
</Link>
```

### Animação de Cards e Zoom

Nos cards de produtos e categorias, aplicaremos movimento composto:

```tsx
<motion.div
  whileHover={shouldReduce ? {} : { y: -6, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.18)" }}
  transition={{ duration: 0.25, ease: "easeOut" }}
  className="group rounded-xl border border-border bg-card overflow-hidden"
>
  <div className="relative overflow-hidden aspect-square">
    <motion.div
      whileHover={shouldReduce ? {} : { scale: 1.06 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative w-full h-full"
    >
      <Image ... />
    </motion.div>
  </div>
</motion.div>
```

---

## Decisões técnicas (ADR)

**ADR-27 — CSS Transitions vs Framer Motion para Desempenho:**
Para evitar overhead de renderização em cliques e passagens rápidas de mouse, utilizaremos Framer Motion preferencialmente em estruturas de layout dinâmicas (como o indicador deslizante `layoutId` ou dropdowns) e transições CSS simples (classe `transition-transform duration-200`) em botões onde a animação linear é suficiente.

**ADR-28 — Monitoramento de Scroll Passivo (Navbar):**
Ao adicionar o listener de scroll para o efeito sticky shrink, usaremos `passive: true` no listener de evento do navegador e aplicaremos debounce/throttle leve para evitar repaints sucessivos que causam lag na rolagem da página em dispositivos de baixo desempenho.

---

## Checklist de Implementação

- [ ] 1. Habilitar `"use client"` em `Navbar.tsx` e implementar o hook de scroll listener passivo para encolhimento da barra de navegação.
- [ ] 2. Desenvolver o pilar flutuante de hover dos links da Navbar utilizando `layoutId` do Framer Motion.
- [ ] 3. Refatorar o dropdown da categoria Empresarial para abrir/fechar com componentes de animação de entrada/saída `AnimatePresence`.
- [ ] 4. Adicionar `active:scale-[.98] transition-transform duration-150` no `button.tsx` via Tailwind CSS. **Não usar `motion.button`** — incompatível com o `render` prop do `@base-ui/react`.
- [ ] 5. Atualizar os cartões de categorias e produtos com animações de subida de card e aproximação/zoom de imagem no contêiner com corte de transbordo (`overflow-hidden`).
- [ ] 6. Adicionar transições de fade-in no contêiner principal de rotas em `(marketing)/layout.tsx`.
- [ ] 7. Verificar que todos os componentes respeitam a diretriz de acessibilidade do usuário (`useReducedMotion`).
- [ ] 8. Executar testes de compatibilidade em celulares (toque e rolagem horizontal) e fazer build com `npm run build`.

---

## Critérios de Aceitação

- [ ] A Navbar reduz suavemente a sua altura e ganha sombreado escuro após o usuário rolar 20px da página.
- [ ] O indicador deslizante de links acompanha de forma fluida a passagem do mouse no menu desktop.
- [ ] O menu suspenso de Empresarial surge com uma transição suave de fade e escala vertical, desaparecendo da mesma forma ao sair da área.
- [ ] Cards de produto e categoria sobem sutilmente no hover e a imagem se aproxima sem ultrapassar as bordas arredondadas do cartão.
- [ ] Os botões reagem táteis ao clique (efeito de afundar ligeiramente).
- [ ] Não há perda de frames (drops) ao rolar ou interagir com o portal.
- [ ] O projeto compila com sucesso.

---

## Notas

- **Dependência de implementação:** o "Animated Dropdown" do objetivo depende do dropdown Empresarial existir — implementar `2026-06-13-categoria-empresarial` **antes** desta spec.
- **Transições de página no App Router (Next 16):** não há API oficial de page transitions. A implementação via `usePathname` + `AnimatePresence` no layout client é possível mas tem edge cases conhecidos (RSC re-fetch, scroll restoration). Validar com cuidado antes de aprovar o critério.
- **Scroll listener na Navbar:** usar `passive: true` e um flag booleano simples (`let scrolled = false`) em vez de `setState` a cada evento para evitar re-renders desnecessários.
- **ADR-27** já orienta CSS transitions para botões — o critério de efeito tátil é cumprido via `active:scale-[.98]` sem Framer Motion.
