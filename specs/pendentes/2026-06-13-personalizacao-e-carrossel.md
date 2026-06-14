# Homepage: Seção de Personalização e Carrossel em Loop

> **Status:** `pendente`
> **ID:** `2026-06-13-personalizacao-e-carrossel`
> **Criada em:** 2026-06-13
> **Agente:** arquiteto

---

## Contexto

Para aumentar a conversão e demonstrar a qualidade dos produtos confeccionados pela Fase Sport, a Homepage precisa de duas seções adicionais localizadas logo abaixo de "Como Funciona":
1. **CTA de Personalização:** Uma chamada visual de impacto que esclarece que o cliente pode personalizar totalmente seu uniforme "no seu estilo" (escudo, cores, nomes, números, patrocinadores). Esta seção terá um layout clássico de conversão com uma imagem mock/detalhada na esquerda e o texto descritivo com botões na direita.
2. **Carrossel de Uniformes em Loop:** Um banner infinito de movimento contínuo (marquee) exibindo fotografias reais de uniformes prontos já produzidos pela Fase Sport. O estilo deve refletir atletas reais, times amadores, times juvenis e conquistas, combinando com a referência visual enviada pelo cliente.

O uso de animações CSS nativas garantirá excelente performance no Next.js 16 com Tailwind CSS v4, mantendo a experiência fluida sem prejudicar as métricas do Core Web Vitals (especialmente LCP e CLS).

---

## Objetivos

- [ ] Criar o componente de seção `CustomizationCtaSection` contendo:
  - Layout responsivo (2 colunas em desktop, 1 coluna em mobile).
  - Imagem conceitual de personalização na esquerda com cantos arredondados, bordas sutis e sombra premium.
  - Título atraente, parágrafo explicativo destacando a flexibilidade de personalização (cores, escudo, patrocinadores, nomes e números) e botões de ação ("Solicitar Orçamento" e "Chamar no WhatsApp") na direita.
- [ ] Criar o componente de seção `UniformsCarouselSection` contendo:
  - Título e subtítulo sutis preparando o carrossel.
  - Carrossel horizontal em loop infinito e ininterrupto (sem saltos de layout).
  - Duplicidade de itens na DOM para fechar o loop perfeito de 100% a 50% de translação.
  - Pausa automática na animação de rolagem ao passar o mouse por cima (`hover`).
  - Cards de uniformes com efeitos suaves de escala (`scale-105`) e bordas arredondadas.
- [ ] Integrar ambas as seções na Homepage (`src/app/(marketing)/page.tsx`) após `<TestimonialsCarousel />` e antes de `<ContactSection />`. (Ordem canônica definida em `homepage-depoimentos-carousel`; `TestimonialsSection` não existe mais.)
- [ ] Implementar a animação e utilitários CSS do marquee no arquivo global de estilos `src/app/globals.css`.
- [ ] Gerar imagens realistas e premium utilizando a ferramenta de geração de imagem para preencher as seções sem usar placeholders genéricos.

## Fora de escopo

- Sistema interativo de personalização 3D online (a personalização é guiada/humana via WhatsApp ou formulário de orçamento).
- Administração ou upload dinâmico dessas fotos de uniformes na V1 (serão tratadas como assets estáticos no frontend para garantir performance e rapidez na entrega).

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/globals.css` | modificar | Adicionar as definições de `@keyframes` e utilitários CSS do carrossel infinito (marquee). |
| `src/components/sections/CustomizationCtaSection.tsx` | criar | Componente de seção contendo a imagem de detalhe de uniforme e os textos de personalização com botões. |
| `src/components/sections/UniformsCarouselSection.tsx` | criar | Componente contendo a estrutura de loop contínuo e cards de exibição dos mantos já confeccionados. |
| `src/app/(marketing)/page.tsx` | modificar | Integrar as novas seções na ordem correta na página principal. |
| `public/images/customization-cta.jpg` | criar | Imagem gerada do mockup de personalização de uniforme. |
| `public/images/uniform-1.jpg` a `public/images/uniform-6.jpg` | criar | Imagens geradas de uniformes reais da Fase Sport confeccionados (fotos de estúdio e atletas em ação). |

### Decisões técnicas (ADR)

**ADR-13 — Carrossel Marquee via CSS Puro:**
Para otimizar o bundle e evitar dependências de pacotes JS de carrossel de terceiros (como Swiper ou Keen-Slider) que geram overhead de execução no cliente, usaremos um marquee implementado em CSS puro. Ao duplicar a lista de imagens e usar translação linear (`translateX(0%)` para `translateX(-50%)`) com duração balanceada, criamos uma ilusão de rolagem sem fim que consome zero CPU de JavaScript.

**ADR-14 — Otimização de Imagens Dinâmicas com Next.js:**
Todas as imagens do carrossel e do CTA serão renderizadas usando o componente `<Image>` do Next.js. Elas serão posicionadas abaixo da dobra inicial da página, recebendo carregamento preguiçoso (`loading="lazy"`) e dimensões fixas/proporcionais para evitar layout shifts e otimizar o tempo de renderização.

---

## Checklist de Implementação

- [ ] 1. Adicionar utilitários do marquee e animações no `src/app/globals.css`.
- [ ] 2. Gerar a imagem de mockup `customization-cta.jpg` e salvá-la em `public/images/`.
- [ ] 3. Gerar 6 imagens de uniformes reais `uniform-1.jpg` a `uniform-6.jpg` de acordo com a referência do cliente e salvá-las em `public/images/`.
- [ ] 4. Criar o componente `CustomizationCtaSection.tsx` estruturado e estilizado com Tailwind v4.
- [ ] 5. Criar o componente `UniformsCarouselSection.tsx` com a lógica de duplicidade de itens para o loop de marquee.
- [ ] 6. Importar e adicionar as novas seções em `src/app/(marketing)/page.tsx`.
- [ ] 7. Executar a verificação local (`npm run dev`) para conferir o comportamento visual e responsividade.
- [ ] 8. Rodar testes estáticos (`npm run type-check` e `npm run lint`) para garantir a integridade do código.

## Critérios de Aceitação

- [ ] O layout do CTA de Personalização é responsivo (2 colunas em desktop com imagem na esquerda e texto na direita, 1 coluna em telas menores).
- [ ] O carrossel horizontal roda continuamente em loop infinito, sem sobressaltos visuais ou cortes bruscos nas imagens.
- [ ] A velocidade da animação do carrossel é agradável e a rolagem pausa ao passar o mouse por cima de qualquer item do carrossel.
- [ ] Os botões da seção de personalização direcionam corretamente o usuário para a página de orçamento (`/orcamento`) e WhatsApp (`buildWhatsAppUrl()`).
- [ ] O componente não gera Layout Shifts (CLS) detectáveis na navegação da homepage.
- [ ] A compilação do projeto com `npm run build` ocorre sem erros.
- [ ] O marquee respeita `prefers-reduced-motion`: a animação CSS usa `@media (prefers-reduced-motion: reduce) { animation: none; }` ou o utilitário `motion-safe:` do Tailwind, garantindo conformidade WCAG 2.2.2.

---

## Notas

- **Acessibilidade do marquee:** animações contínuas devem poder ser pausadas pelo usuário (WCAG 2.2.2). Além do pause no hover (`:hover { animation-play-state: paused }`), adicionar `@media (prefers-reduced-motion: reduce) { animation: none; }` no keyframe do `globals.css`.
- **Posicionamento:** a âncora desta spec é `<TestimonialsCarousel />` (criado por `homepage-depoimentos-carousel`). Implementar `homepage-depoimentos-carousel` antes desta spec.
