# Homepage: Reformulação da Seção de Modalidades em Seções Temáticas

> **Status:** `pendente`
> **ID:** `2026-06-13-reformulacao-modalidades`
> **Criada em:** 2026-06-13
> **Agente:** arquiteto

---

## Contexto

A seção "Modalidades" atual na Homepage (`CategoriesSection.tsx`) renderiza uma lista simples de cards de categorias (Futebol, Vôlei, Basquete, etc.) buscados do banco de dados. Embora limpo, esse formato oculta a variedade técnica dos produtos da Fase Sport (como as diferentes linhas Prata, Ouro e Profissional, ou variações de coletes e vestuário de passeio).

Para posicionar a marca como especialista e oferecer um catálogo inicial interativo de alto impacto, reformularemos a seção de Modalidades dividindo-a em **5 seções temáticas interativas**. Cada seção contará com um carrossel de imagens para alternar entre as linhas/padrões disponíveis, com controles de setas e botões de ação específicos.

---

## Objetivos

- [ ] Substituir o grid estático de modalidades por um layout estruturado em **5 seções de produtos**:
  1. **Esportes (Futebol, Vôlei, Handebol, Escolinha):**
     - Carrossel interativo (com setas esquerda/direita) para mudar imagens das linhas: *Linha Prata*, *Linha Ouro*, *Profissional*, e *Escolinha*.
     - Logo abaixo do carrossel, botões de atalho para ver os catálogos/filtros de: *Futebol*, *Vôlei*, *Handebol* e *Escolinha*.
  2. **Basquete:**
     - Carrossel mostrando os padrões de basquete nas 3 linhas principais: *Linha Prata*, *Linha Ouro* e *Profissional*.
  3. **Coletes:**
     - Carrossel com imagens das opções: *Colete Aberto*, *Colete Fechado Simples* e *Colete Dupla Face*.
  4. **Passeio:**
     - Carrossel exibindo as opções: *Passeio Comissão* e *Passeio Torcida*.
  5. **Agasalhos, Calças e Acessórios:**
     - Carrossel exibindo as opções: *Agasalhos*, *Calças* e *Acessórios*.
- [ ] Implementar a interatividade do carrossel em cada seção:
  - Estado local para gerenciar a linha/modelo selecionado.
  - Setas laterais para trocar o modelo selecionado de forma cíclica.
  - Cliques opcionais em títulos/indicadores para acesso rápido a uma linha específica.
  - Efeito visual de transição suave (fade-in / fade-out) ao mudar de modelo.
- [ ] Projetar uma interface moderna, clean e responsiva (mobile-friendly), empilhando as seções verticalmente e garantindo facilidade de toque nas setas do carrossel em celulares.

---

## Fora de escopo

- Criação de tabelas adicionais no banco de dados para gerenciar dinamicamente estas sublinhas na V1 (será estruturado por meio de um vetor/array estático de dados no frontend para garantir velocidade no carregamento e facilidade de manutenção).
- Links para páginas internas de "sublinhas" individuais (os links de catálogo levarão para a categoria geral correspondente no catálogo).

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/components/sections/CategoriesSection.tsx` | modificar | Substituir o grid genérico por uma estrutura de 5 seções temáticas, contendo carrosséis internos e botões de atalhos. |
| `src/app/(marketing)/page.tsx` | modificar | Ajustar as propriedades ou dados passados para a nova seção de modalidades (caso necessário). |
| `public/images/modalities/` | criar | Pasta para armazenar as novas imagens de mockup geradas para cada linha de cada modalidade. |

### Estrutura do Vetor de Configuração

Cada uma das 5 seções será configurada por meio de vetores no componente client para renderizar os dados e controlar as imagens:

```typescript
interface ModalityLineItem {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
}

interface ModalitySection {
  title: string;
  subtitle?: string;
  lines: ModalityLineItem[];
  catalogLinks?: { label: string; href: string }[];
}

const MODALITY_SECTIONS: ModalitySection[] = [
  {
    title: "Esportes",
    subtitle: "Futebol, Vôlei, Handebol e Escolinha",
    lines: [
      { id: "prata", name: "Linha Prata", imageUrl: "/images/modalities/esportes-prata.jpg", description: "Excelente custo-benefício para times amadores com tecido dry-fit de qualidade." },
      { id: "ouro", name: "Linha Ouro", imageUrl: "/images/modalities/esportes-ouro.jpg", description: "Sublimação total em alta definição e modelagem atlética." },
      { id: "profissional", name: "Profissional", imageUrl: "/images/modalities/esportes-profissional.jpg", description: "Tecidos tecnológicos combinados, gola personalizada e recortes dry." },
      { id: "escolinha", name: "Escolinha", imageUrl: "/images/modalities/esportes-escolinha.jpg", description: "Kits duráveis com foco em mobilidade e conforto para jovens atletas." }
    ],
    catalogLinks: [
      { label: "Ver Futebol", href: "/futebol" },
      { label: "Ver Vôlei", href: "/volei" },
      { label: "Ver Handebol", href: "/handebol" },
      { label: "Ver Escolinha", href: "/futebol?sub=infantil" }
    ]
  },
  {
    title: "Basquete",
    lines: [
      { id: "basquete-prata", name: "Linha Prata", imageUrl: "/images/modalities/basquete-prata.jpg", description: "Modelagem tradicional de basquete americana com tecido respirável." },
      { id: "basquete-ouro", name: "Linha Ouro", imageUrl: "/images/modalities/basquete-ouro.jpg", description: "Design moderno com sublimação completa, gola diferenciada." },
      { id: "basquete-profissional", name: "Profissional", imageUrl: "/images/modalities/basquete-profissional.jpg", description: "Linha profissional com recortes dry, bordas elásticas e alta ventilação." }
    ]
  },
  {
    title: "Coletes",
    lines: [
      { id: "colete-aberto", name: "Colete Aberto", imageUrl: "/images/modalities/colete-aberto.jpg", description: "Ajuste por fitas elásticas nas laterais, alta praticidade." },
      { id: "colete-fechado", name: "Fechado Simples", imageUrl: "/images/modalities/colete-fechado.jpg", description: "Fechamento clássico lateral, caimento leve para treinos." },
      { id: "colete-dupla", name: "Dupla Face", imageUrl: "/images/modalities/colete-dupla.jpg", description: "Um único colete com duas cores totalmente usáveis, agilidade na divisão de equipes." }
    ]
  },
  {
    title: "Passeio",
    lines: [
      { id: "passeio-comissao", name: "Passeio Comissão", imageUrl: "/images/modalities/passeio-comissao.jpg", description: "Polos e camisas de botão para staff e equipe técnica." },
      { id: "passeio-torcida", name: "Torcida", imageUrl: "/images/modalities/passeio-torcida.jpg", description: "Camisetas casuais sublimadas e personalizadas para apoiadores e famílias." }
    ]
  },
  {
    title: "Agasalhos, Calças e Acessórios",
    lines: [
      { id: "agasalhos", name: "Agasalhos", imageUrl: "/images/modalities/agasalho.jpg", description: "Jaquetas corta-vento ou de helanca com zíper e bolsos." },
      { id: "calcas", name: "Calças", imageUrl: "/images/modalities/calca.jpg", description: "Calças de treino flexíveis com ajuste elástico." },
      { id: "acessorios", name: "Acessórios", imageUrl: "/images/modalities/acessorio.jpg", description: "Meiões, tornozeleiras e headbands para fechar o uniforme do time." }
    ]
  }
];
```

### Layout e Estilização Tailwind CSS

- **Card Temático (Seção):** Cada uma das seções será exibida como um bloco horizontal (ou vertical em mobile) com:
  - Painel de informações na esquerda (Título, nome da linha ativa, descrição da linha, atalhos/botões).
  - Carrossel na direita: exibindo a imagem do modelo ativo com setas circulares sobrepostas nas bordas laterais para navegar.
- **Transição de Modelo:** Mudanças de imagem usarão transição de opacidade suave (`opacity-0` para `opacity-100` via Framer Motion ou classe de transição do Tailwind) para evitar cortes secos desagradáveis.
- **Responsividade:** Em telas mobile (`sm` e `md`), o layout se inverte colocando o carrossel no topo e os botões/detalhes logo abaixo para otimizar o fluxo de leitura de cima para baixo.

---

## Decisões técnicas (ADR)

**ADR-19 — Estruturação Estática no Frontend com Assets Fixos:**
Dada a necessidade de ilustrar especificidades técnicas da produção (como o caimento do colete aberto vs fechado, ou tecido prata vs profissional), utilizaremos imagens de mockups e modelos específicos armazenadas na pasta `public/images/modalities/`. Isso garante excelente performance no LCP sem depender de uploads de fotos pelo admin do CMS, que se destina apenas ao catálogo individual de produtos dinâmicos.

**ADR-20 — Controle Isolado de Slides (Estados Independentes):**
Para que o usuário possa navegar nas linhas de "Esportes" sem alterar a visualização ativa nas seções de "Basquete" ou "Coletes", cada bloco terá seu próprio escopo de estado React. Criaremos um subcomponente interno `ModalitySectionBlock` contendo o carrossel e detalhes da seção de forma encapsulada.

---

## Checklist de Implementação

- [ ] 1. Criar a pasta `public/images/modalities/` para organizar as novas ilustrações.
- [ ] 2. Utilizar a ferramenta de geração de imagem para criar mockups de qualidade das linhas (Prata, Ouro, Profissional) para Esportes, Basquete, Coletes, Passeio e Agasalhos.
- [ ] 3. Criar o subcomponente `ModalitySectionBlock.tsx` (dentro da pasta de seções ou no próprio arquivo) para encapsular o carrossel de fotos, setas e detalhes de cada modalidade.
- [ ] 4. Substituir a implementação anterior de `CategoriesSection.tsx` para carregar a lista de 5 seções temáticas descritas na abordagem técnica.
- [ ] 5. Ajustar o design dos botões de catálogos na seção "Esportes", alinhando-os em grid de 2x2 ou linha horizontal em telas maiores.
- [ ] 6. Revisar as referências de importação do componente na Homepage (`page.tsx`) e certificar-se de que os dados do banco (que alimentavam o antigo grid) agora sejam tratados de forma segura ou removidos se não forem mais necessários.
- [ ] 7. Realizar testes de acessibilidade (foco do teclado nas setas, suporte a leitores de tela) e usabilidade de toque no carrossel de celulares.
- [ ] 8. Rodar build (`npm run build`) para assegurar que não existam erros de compilação.

---

## Critérios de Aceitação

- [ ] O componente exibe exatamente as 5 seções listadas na ordem correta.
- [ ] Os carrosséis internos funcionam de forma independente (mudar o slide do Basquete não interfere no Colete).
- [ ] Cada carrossel permite avançar e retroceder as imagens das linhas de produto com as setas esquerda/direita de forma cíclica.
- [ ] Os botões de atalho da seção "Esportes" direcionam o usuário para as respectivas páginas de categoria do catálogo.
- [ ] O visual é responsivo, apresentando layouts fluidos e de fácil manipulação em dispositivos móveis e desktops.
- [ ] A aplicação compila com sucesso.

---

## Notas

- **Assets de imagem:** as 14+ imagens em `public/images/modalities/` não existem ainda. `next/image` retorna erro 404 se `src` apontar para arquivo ausente. Criar placeholders de dimensão correta (ex: 800×600px) antes do build final, ou usar `src` condicional com fallback.
- **Dependência de dados — "Ver Escolinha":** o link `/futebol?sub=infantil` requer que exista uma subcategoria com `slug = "infantil"` na categoria futebol no banco (Neon/produção). Adicionar ao seed e confirmar no ambiente de produção antes de liberar.
- **Contrato com `page.tsx`:** o `CategoriesSection` atual recebe a prop `categories` vinda do banco. Ao substituir por dados estáticos, remover a query de categorias do `page.tsx` **ou** mantê-la e ignorá-la na nova implementação — não deixar prop órfã gerando TypeScript error.
- **Ordem na home:** esta spec modifica `CategoriesSection` (2ª posição); não altera a posição em si. A ordem canônica das seções é definida em `homepage-depoimentos-carousel`.
