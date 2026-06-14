# Homepage: Uniformes de Destaque após o Hero em Carrossel de 10s

> **Status:** `pendente`
> **ID:** `2026-06-13-destaques-carrossel`
> **Criada em:** 2026-06-13
> **Agente:** arquiteto

---

## Contexto

A Homepage atualmente exibe a seção "Destaques da Semana" (`FeaturedSection.tsx`) após as Categorias (`CategoriesSection.tsx`). A quantidade de produtos nesta seção está limitada a 4 itens devido à query do Prisma (`take: 4`), e os itens são renderizados em um grid estático.

Para dar maior visibilidade aos modelos confeccionados de destaque e criar uma experiência inicial dinâmica de alto impacto visual, precisamos:
1. Mover a seção de Destaques para logo abaixo do Hero (`HeroSection.tsx`).
2. Ampliar a quantidade de itens na consulta ao banco substituindo o limite estático de 4 por um teto de segurança de 16 itens (para garantir performance de carregamento e LCP).
3. Transformar o grid estático em um **carrossel interativo dinâmico** que realiza a transição automática de slides a cada **10 segundos**, com controles manuais de navegação (setas e indicadores de bolinha).

---

## Objetivos

- [ ] Reordenar as seções na Homepage (`src/app/(marketing)/page.tsx`) para posicionar `<FeaturedSection />` na **3ª posição**, após `<CategoriesSection />` e antes de `<HowItWorksSection />`. (Ordem canônica definida em `homepage-depoimentos-carousel`.)
- [ ] Substituir o limite `take: 4` por `take: 16` na query de produtos em destaque na função `getHomepageData()` no arquivo da Homepage como limite de segurança.
- [ ] Transformar o componente `FeaturedSection.tsx` em um Client Component (`"use client"`) interativo e animado.
- [ ] Implementar a lógica de carrossel de transição automática:
  - Timer automático (`setInterval`) de 10000ms (10 segundos) para alternar o slide/página.
  - Botões de navegação lateral (Anterior/Próximo) com ícones da biblioteca Lucide.
  - Indicadores de paginação (Dots) na base do carrossel para navegação rápida.
  - Pausa automática do temporizador no hover do mouse para que o usuário consiga ler e interagir sem transição forçada.
  - Suporte a arraste (drag) em dispositivos móveis via Framer Motion ou toque nativo.
- [ ] Configurar a exibição responsiva de cards simultâneos no carrossel:
  - Telas Desktop (`lg` e superior): 4 cards visíveis por vez.
  - Telas Tablet (`md`): 2 a 3 cards visíveis por vez.
  - Telas Mobile (`sm` e inferior): 1 card visível por vez.

---

## Fora de escopo

- Rolagem infinita pixel-a-pixel contínua (estilo marquee) nesta seção — esta rolagem contínua é de uso exclusivo da seção `UniformsCarouselSection` (Galeria de fotos de uniformes prontos). Para os Destaques, usaremos uma transição estruturada de slides/páginas.

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/(marketing)/page.tsx` | modificar | Mover a seção de destaque para depois do hero e remover o limite `take: 4` da consulta ao banco. |
| `src/components/sections/FeaturedSection.tsx` | modificar | Transformar em `"use client"`, implementar controles do carrossel (índice, temporizador de 10s, paginação por dots, setas) e aplicar animações de transição de slide com Framer Motion. |

### Lógica do Carrossel (Client State)

O carrossel será implementado mantendo o estado de índice atual. Como a quantidade de itens visíveis simultaneamente varia por tamanho de tela, podemos calcular o número de slides/páginas máximas de forma dinâmica no client ou agrupar os itens.

```typescript
// ⚠️ PSEUDOCÓDIGO — não copiar diretamente; hooks devem estar dentro do componente
"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/products/ProductCard";

// (dentro do componente FeaturedSection)
const [currentIndex, setCurrentIndex] = useState(0);
const [isHovered, setIsHovered] = useState(false);

// Número de itens visíveis por tela (adaptado responsivamente)
const itemsPerPage = {
  mobile: 1,  // < 768px
  tablet: 2,  // >= 768px && < 1024px
  desktop: 4, // >= 1024px
};
```

Para evitar desalinhamentos e quebras de layout estático durante o carregamento (SSR/Hydration), a largura do track e a tradução CSS serão calculadas com precisão utilizando porcentagem com base no número de itens, garantindo que o primeiro frame renderize corretamente antes da ativação do JS.

### Efeitos Visuais e Transições

- A transição entre os slides utilizará animação de translação suave via Framer Motion ou transição de CSS nativa com aceleração de hardware (ex: `transform 700ms cubic-bezier(0.4, 0, 0.2, 1)`).
- Os botões laterais de controle ficarão visíveis de forma sutil e ganharão destaque de opacidade no hover.
- O carrossel deve pausar imediatamente o contador de 10 segundos quando o cursor do mouse estiver sobre a seção (`onMouseEnter` -> `setIsHovered(true)`).

---

## Decisões técnicas (ADR)

**ADR-17 — Prevenção de Hydration Mismatch em Carrossel Responsivo:**
Carrosséis que dependem do tamanho de tela para saber quantos itens exibir podem causar divergências entre o HTML gerado no servidor e o código hidratado no navegador. Resolveremos isso renderizando todos os itens em um flex-row com `overflow-x-auto` nativo no mobile/server HTML. Após a montagem do componente (`useEffect`), ativamos a navegação por slides interativos e os botões, escondendo a barra de rolagem nativa via CSS (`scrollbar-none`).

**ADR-18 — Controle Estrito do Intervalo (Pausa no Hover):**
Para evitar que o slide mude no exato momento em que o usuário tenta clicar no botão de WhatsApp do card de produto, o temporizador de 10 segundos será resetado e pausado em interações de hover e focos de teclado nos cartões.

**ADR-29 — Desativação de Controles para Listas Reduzidas:**
Se a quantidade de produtos destacados vindos da query do banco for menor ou igual à quantidade exibida na largura de tela do cliente (ex: apenas 2 produtos cadastrados no desktop), o carrossel desativará a rolagem automática (`setInterval`), as setas laterais e os dots de navegação, mantendo os cards fixos.

---

## Checklist de Implementação

- [ ] 1. Alterar a consulta Prisma em `src/app/(marketing)/page.tsx` para substituir a limitação de 4 produtos em destaque por um teto de 16 produtos (`take: 16`).
- [ ] 2. Mover a chamada do componente `<FeaturedSection />` no retorno de `HomePage()` para a **3ª posição** — após `<CategoriesSection />` e antes de `<HowItWorksSection />`.
- [ ] 3. Adicionar a diretiva `"use client"` no topo de `src/components/sections/FeaturedSection.tsx`.
- [ ] 4. Implementar a detecção de itens visíveis por página (ou largura do container) de forma amigável ao SSR.
- [ ] 5. Criar os botões de navegação lateral (setas) e o rodapé de indicadores de bolinha (dots) estilizados com Tailwind v4.
- [ ] 6. Configurar o temporizador `setInterval` de 10.000ms para avançar de página, adicionando guards para limpar o intervalo no unmount (`clearInterval`) e pausar no hover (`isHovered`).
- [ ] 7. Utilizar Framer Motion (`motion.div` no track) para animar a transição horizontal suave de slides baseada no índice atual.
- [ ] 8. Testar o fluxo de navegação manual pelas setas e pelos dots, verificando o reset correto do timer de 10s após a ação manual do usuário.
- [ ] 9. Executar a validação estática de builds (`npm run build` e `npm run lint`) para homologação.

---

## Critérios de Aceitação

- [ ] A seção "Destaques da Semana" é exibida após `<CategoriesSection />` e antes de `<HowItWorksSection />` (3ª posição na home).
- [ ] Os uniformes marcados como ativos e de destaque no banco de dados são carregados até o limite máximo de 16 itens.
- [ ] O carrossel transiciona automaticamente para o próximo lote/slide a cada 10 segundos quando não há interações e o número de itens é superior ao visível por página.
- [ ] Passar o mouse sobre a seção pausa o temporizador automático de transição.
- [ ] A navegação pelas setas esquerda/direita e bolinhas inferiores funciona perfeitamente, reposicionando a visualização de forma suave.
- [ ] O carrossel é responsivo, apresentando 4 colunas em telas de desktop, 2 colunas em telas de tablet e 1 coluna centralizada em celulares.
- [ ] Não há erros de hydration nos logs de desenvolvimento do console do navegador.
