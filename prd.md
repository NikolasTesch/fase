# Fase Sport — Product Requirements Document

> **Versão:** v1.0 — Junho 2025
> **Status:** Rascunho para Revisão
> **Escopo:** Landing Page + Catálogo (V1)

---

## Sumário

1. [Contexto e Visão Geral](#1-contexto-e-visão-geral)
2. [Personas e Público-Alvo](#2-personas-e-público-alvo)
3. [Análise Competitiva](#3-análise-competitiva)
4. [Escopo do Produto — V1](#4-escopo-do-produto--v1)
5. [Requisitos de UI/UX](#5-requisitos-de-uiux)
6. [Requisitos Não-Funcionais](#6-requisitos-não-funcionais)
7. [Roadmap](#7-roadmap)

---

## 1. Contexto e Visão Geral

### 1.1 Sobre a Fase Sport

A Fase Sport é uma loja de artigos esportivos e uniformes personalizados sediada em Colatina, ES. Além de comercializar produtos de marcas consolidadas, a empresa possui uma linha própria de uniformes feitos sob medida — voltados a times, academias, escolinhas, atléticas universitárias e eventos corporativos.

Apesar da qualidade reconhecida localmente, a Fase carece de presença digital estruturada quando comparada a concorrentes de alcance nacional como Ícone Sports (`iconesports.com.br`) e Falo Sports (`falosports.com`). A loja atual (`loja.fasesport.com`), hospedada na Nuvemshop, não destaca a linha de personalizados e não apresenta os modelos de forma visual e conversiva.

### 1.2 Problema

> **Problema Central:** A Fase Sport não converte visitantes em clientes de uniformes personalizados porque o site atual não comunica visualmente os produtos, não organiza as categorias por esporte/modalidade e não oferece um caminho claro para solicitar um orçamento.

**Sintomas observados:**

- Concorrentes têm catálogos visuais por modalidade — Fase não tem equivalente
- O simulador já existe (`simulador.fasesport.com`) mas não é apresentado como CTA central
- Não há galeria de modelos reais por categoria de uniforme
- Nenhuma seção de "como funciona" (prazo, quantidade mínima, processo de pedido)
- SEO fraco: sem landing pages otimizadas por modalidade esportiva

### 1.3 Objetivo do Produto

Criar uma plataforma web moderna, focada em conversão, que posicione a Fase Sport como referência regional em uniformes esportivos personalizados. A plataforma deve:

- Apresentar os produtos com qualidade visual comparável à Ícone e Falo
- Organizar o catálogo por modalidade esportiva com modelos reais
- Direcionar o visitante para o simulador ou WhatsApp como canal de conversão
- Ser altamente performática, acessível e amigável em mobile
- Ser sustentável tecnicamente para evoluir para integrações futuras (V2 / NKS)

### 1.4 Definição de Sucesso — KPIs Esperados

| Métrica | Baseline Atual | Meta V1 (6 meses) |
|---|---|---|
| Taxa de conversão (contato/visita) | < 1% | > 3% |
| Cliques no simulador por sessão | n/d | > 20% das sessões |
| Tempo médio na página | n/d | > 2 min |
| Taxa de rejeição (bounce) | Alto | < 50% |
| Tráfego orgânico (SEO) | Baixo | +40% em 3 meses |
| Leads via WhatsApp/formulário | n/d | > 15 por semana |

---

## 2. Personas e Público-Alvo

### Persona 1 — O Técnico / Dirigente de Time Amador

| | |
|---|---|
| **Perfil** | Homem, 28–50 anos, responsável por organizar o time. Busca custo-benefício e praticidade. |
| **Dor Principal** | Não sabe quantos modelos existem, tem medo de errar o pedido, quer ver como vai ficar antes. |
| **Motivação** | Uniformizar o time de forma profissional sem precisar ir pessoalmente à loja. |
| **Canal de Chegada** | Indicação de amigo, busca no Google ("uniforme futebol personalizado ES"), Instagram. |
| **Ação Desejada** | Acessar catálogo de futebol → escolher modelo → chamar no WhatsApp. |

### Persona 2 — A Coordenadora de Atlética Universitária

| | |
|---|---|
| **Perfil** | Mulher, 18–25 anos, estudante universitária, muito ativa em redes sociais. |
| **Dor Principal** | Precisa de múltiplas peças (camisas, shorts, agasalhos) com identidade visual da atlética. |
| **Motivação** | Criar um kit completo que seja bonito e represente bem a entidade. |
| **Canal de Chegada** | Instagram, TikTok, indicação de outras atléticas. |
| **Ação Desejada** | Ver kits completos por esporte → usar simulador para personalizar → solicitar orçamento. |

### Persona 3 — O Responsável por Academia / Escola de Esporte

| | |
|---|---|
| **Perfil** | Empreendedor, 30–55 anos, dono de academia ou coordenador de escolinha de futebol/vôlei. |
| **Dor Principal** | Precisa de uniformes para alunos/atletas em quantidade, quer qualidade e padronização. |
| **Motivação** | Profissionalizar a identidade visual da sua escola ou academia. |
| **Canal de Chegada** | Busca no Google, indicação, contato direto pelo WhatsApp. |
| **Ação Desejada** | Ver opções de kits → entender prazo e qtd. mínima → solicitar orçamento via formulário. |

### Persona 4 — Comprador Corporativo / Evento

| | |
|---|---|
| **Perfil** | Gestor de RH ou marketing em empresa, 28–45 anos. Busca fardamento ou camisas para evento. |
| **Dor Principal** | Precisa de nota fiscal, prazo confiável, atendimento profissional. |
| **Motivação** | Criar camisetas/kits personalizados para evento corporativo ou confraternização. |
| **Canal de Chegada** | Busca no Google, LinkedIn, indicação. |
| **Ação Desejada** | Entender o processo → ver modelos corporativos → enviar formulário de orçamento detalhado. |

---

## 3. Análise Competitiva

### 3.1 Ícone Sports — `iconesports.com.br`

Principal referência de UX para o projeto. Pontos fortes:

- Hero banner de alta qualidade com carousel de produtos
- Categorias por modalidade com tabs (Futebol, Basquete, Vôlei, Handebol, Passeio, Agasalho)
- CTA duplo por categoria: **Simulador** + **Catálogo**
- Simulador de uniforme muito completo e intuitivo
- Linha Euro (pronta entrega) bem destacada com seção dedicada
- Depoimentos de clientes e logos de times atendidos
- Seção "como funciona" / processo de pedido clara
- SEO forte: páginas por modalidade bem otimizadas

**Oportunidade para a Fase:** replicar essa estrutura visual com produtos Fase reais. A Fase pode diferenciar mostrando fotos de clientes reais (prova social local) e destacando o prazo de entrega competitivo.

### 3.2 Falo Sports — `falosports.com`

Referência de arquitetura de informação e categorização. Pontos fortes:

- Navegação por modalidade muito clara: cards visuais grandes por esporte
- Sub-categorias bem organizadas (Futebol, Basquete, Colete, Agasalho, Comissão, Passeio, Torcida, Escudos, Numerações)
- Seção de Acessórios estruturada (Bolsa, Meião, Bola, Luva, Bandeirão etc.)
- Linha de Fardamento Empresarial separada do esporte
- Simulador com link de destaque no nav

**Oportunidade para a Fase:** adotar essa arquitetura de categorias com imagens de produtos reais da Fase e integração direta com WhatsApp por categoria.

### 3.3 Gap Analysis

| Funcionalidade / Aspecto | Ícone | Falo | Fase Atual | Meta V1 |
|---|:---:|:---:|:---:|:---:|
| Hero Banner visual de impacto | ✅ | ✅ | ❌ | ✅ |
| Catálogo por modalidade esportiva | ✅ | ✅ | ❌ (por gênero) | ✅ |
| Fotos reais dos produtos por modelo | ✅ | ✅ | ⚠️ Parcial | ✅ |
| CTA Simulador em destaque | ✅ | ✅ | ⚠️ Link no nav | ✅ |
| CTA WhatsApp por categoria | ⚠️ | ✅ | ⚠️ | ✅ |
| Seção "Como Funciona" / Processo | ✅ | ❌ | ❌ | ✅ |
| Depoimentos / Prova Social | ✅ | ❌ | ❌ | ✅ |
| SEO por modalidade (páginas dedicadas) | ✅ | ✅ | ❌ | ✅ |
| Mobile-first / Responsivo | ✅ | ✅ | ⚠️ | ✅ |
| Performance (Core Web Vitals) | ⚠️ | ⚠️ | ❌ | ✅ |
| Formulário de orçamento detalhado | ✅ | ✅ | ❌ | ✅ |
| Linha pronta-entrega destacada | ✅ (Euro) | ❌ | ❌ | V2 |

---

## 4. Escopo do Produto — V1

> **Foco da V1:** Uma landing page estruturada como catálogo visual + páginas de categoria.
> A V1 é um **site institucional/catálogo**, não uma loja e-commerce de transação.
> O objetivo é apresentar produtos e converter em contatos (WhatsApp / formulário).

### 4.1 Páginas e Seções

#### 4.1.1 Homepage / Landing Page Principal

Estrutura de seções na ordem de rolagem:

1. **Navbar fixa** — logo, links de navegação, CTA "Orçamento" e botão WhatsApp
2. **Hero Section** — imagem/vídeo full-width com headline, subheadline e dois CTAs (Simulador e Orçamento)
3. **Categorias** — cards visuais com ícone do esporte levando às páginas de categoria
4. **Destaque da Semana** — 3–4 produtos/modelos em destaque com foto real e CTA
5. **Como Funciona** — 4 etapas ilustradas: Escolha o Modelo → Personalize → Confirme o Pedido → Receba
6. **Nossos Clientes** — logos de times/academias atendidas + depoimentos em carrossel
7. **Por que a Fase?** — diferenciais (qualidade, prazo, atendimento, ES)
8. **Contato / Orçamento** — formulário simplificado + mapa / endereço
9. **Footer** — links, redes sociais, informações de contato, selos

#### 4.1.2 Páginas de Categoria por Modalidade

| Página | URL | Sub-categorias |
|---|---|---|
| Futebol | `/futebol` | Conjunto Completo, Camisa, Short, Goleiro, Colete |
| Vôlei | `/volei` | Conjunto, Camisa, Short/Saia, Feminino |
| Basquete | `/basquete` | Conjunto, Camisa, Short |
| Handebol | `/handebol` | Conjunto, Camisa, Short |
| Passeio / Comissão | `/passeio` | Camisa Polo, Calça de Moletom, Conjunto |
| Agasalho | `/agasalho` | Agasalho Completo, Moletom, Calça |
| Colete | `/colete` | Colete de Futebol, Colete Numerado |
| Acessórios | `/acessorios` | Meião, Bolsa, Bola, Faixa de Capitão |

Estrutura de cada página de categoria:

- Header da categoria com foto de fundo e headline ("Uniforme de Futebol 100% Personalizado")
- Filtro por sub-categoria
- Grid de modelos com foto real, nome do modelo, tecido e CTA "Ver Detalhes"
- Página de detalhe do modelo: galeria de fotos, descrição técnica, tecidos disponíveis, CTA simulador + CTA WhatsApp
- FAQ específico da modalidade
- CTA flutuante de WhatsApp em mobile

#### 4.1.3 Página "Como Personalizar" / Processo

- Passo a passo visual detalhado do processo de personalização
- FAQ expandível: prazo, quantidade mínima, tipos de personalização, formas de pagamento
- Integração com link do simulador

#### 4.1.4 Página de Contato / Orçamento

- Formulário multi-step: Modalidade → Quantidade → Detalhes → Contato
- Integração com WhatsApp (link com mensagem pré-formatada)
- Notificação por e-mail para a equipe Fase
- Google Maps embed com localização da loja

### 4.2 Matriz de Prioridade

| Funcionalidade | Prioridade | V1 | V2 |
|---|:---:|:---:|:---:|
| Landing Page completa com todas as seções | CRÍTICA | ✅ | — |
| Páginas de categoria por modalidade | CRÍTICA | ✅ | — |
| Grid de modelos com fotos reais | CRÍTICA | ✅ | — |
| Integração WhatsApp por categoria | CRÍTICA | ✅ | — |
| Formulário de orçamento multi-step | ALTA | ✅ | — |
| CTA Simulador em destaque | ALTA | ✅ | — |
| Seção "Como Funciona" | ALTA | ✅ | — |
| Depoimentos e prova social | ALTA | ✅ | — |
| SEO on-page por modalidade | ALTA | ✅ | — |
| CMS para gestão de produtos/modelos | ALTA | ✅ | — |
| Animações e micro-interações UX | MÉDIA | ✅ | — |
| Busca de produtos | MÉDIA | ✅ | — |
| Simulador de uniforme próprio | MÉDIA | — | ✅ |
| Área do cliente (login/pedidos) | BAIXA | — | ✅ |
| E-commerce (carrinho e pagamento) | BAIXA | — | ✅ |
| Integração NKS | BAIXA | — | ✅ |
| App mobile | BAIXA | — | v3 |

---

## 5. Requisitos de UI/UX

### 5.1 Princípios de Design

- **Mobile-First** — 60%+ dos usuários chegam pelo celular. Toda interface projetada primeiro para 375px.
- **Visual Heavy** — a venda de uniformes é emocional. Imagens de alta qualidade de produtos reais são prioridade.
- **Conversão Central** — cada seção deve ter um CTA claro. Máximo de 2 CTAs por dobra.
- **Velocidade** — Core Web Vitals verde. LCP < 2.5s. Imagens otimizadas via Cloudflare R2.
- **Acessibilidade** — WCAG 2.1 AA. Contraste adequado, labels semânticos, navegação por teclado.

### 5.2 Design System — Tokens de Cor

| Token | Cor | Uso |
|---|---|---|
| `--color-primary` | `#1A2B5F` (Azul Fase) | Headers, botões primários, navbar |
| `--color-accent` | `#E8B500` (Dourado Fase) | CTAs secundários, destaques, hover states |
| `--color-surface` | `#F7F9FF` | Backgrounds de seção alternados |
| `--color-text` | `#2D2D2D` | Textos principais |
| `--color-text-muted` | `#666666` | Textos secundários, labels |
| `--color-border` | `#E2E8F0` | Divisores, bordas de card |

> A identidade visual base do `loja.fasesport.com` é mantida. A reformulação é estrutural, não de marca.

### 5.3 Componentes de UI Principais

| Componente | Descrição |
|---|---|
| `HeroSection` | Banner full-width com overlay, headline animada, 2 CTAs. Suporte a imagem e vídeo de fundo. |
| `CategoryCard` | Card com imagem de fundo, ícone de esporte, nome da modalidade, hover com zoom sutil. |
| `ProductCard` | Foto do produto, nome do modelo, badge de tecido, botão "Ver Detalhes". Grid responsivo. |
| `ProductGallery` | Galeria com thumbnail strip, zoom on hover, swipe em mobile. |
| `ProcessStep` | Ícone + número + título + descrição. Layout horizontal no desktop, vertical no mobile. |
| `TestimonialSlider` | Carrossel com foto, nome, time/academia, texto do depoimento. |
| `WhatsAppButton` | FAB flutuante em mobile, botão inline em desktop. Abre chat com mensagem pré-formatada. |
| `FilterBar` | Tabs de sub-categoria + ordenação. Sticky abaixo da navbar em páginas de catálogo. |
| `OrcamentoForm` | Form multi-step com validação em tempo real. Steps: Modalidade → Quantidade → Detalhes → Contato. |
| `BreadcrumbNav` | Navegação contextual para páginas de categoria e produto. |
| `StickyNav` | Navbar que se torna compacta ao rolar. Logo + links + botão WhatsApp + CTA Orçamento. |

### 5.4 Wireframes — Estrutura das Páginas

#### Homepage

```
[NAVBAR] Logo | Futebol · Vôlei · Basquete · ... · Contato  |  [WhatsApp] [Orçamento →]

[HERO] Imagem full-width impactante
       Headline: "Uniformes Esportivos que Representam Sua Equipe"
       Sub: "Personalizados para times, academias e atléticas"
       [→ Simular Uniforme]  [→ Pedir Orçamento]

[CATEGORIAS] "Escolha sua Modalidade"
       [ Futebol ] [ Vôlei ] [ Basquete ] [ Handebol ]
       [ Passeio ] [ Agasalho ] [ Colete ] [ Acessórios ]

[DESTAQUE] 3–4 cards de produtos em destaque

[COMO FUNCIONA]
       1. Escolha o Modelo  2. Personalize  3. Confirme  4. Receba

[CLIENTES] Carrossel de logos + depoimentos

[POR QUE A FASE?] 3–4 diferenciais em ícone + texto

[CONTATO] Formulário de orçamento + endereço + mapa

[FOOTER] Links | Redes | Contato | Selos
```

#### Página de Categoria

```
[HERO DA CATEGORIA] "Uniforme de Futebol Personalizado" + breadcrumb

[FILTROS] [Todos] [Conjunto] [Camisa] [Short] [Goleiro] [Colete]  |  Ordenar: Relevância ▼

[GRID DE PRODUTOS] — 3 colunas desktop / 2 tablet / 1 mobile
   +-------------+  +-------------+  +-------------+
   | Foto Modelo |  | Foto Modelo |  | Foto Modelo |
   | Nome Modelo |  | Nome Modelo |  | Nome Modelo |
   | Tecido      |  | Tecido      |  | Tecido      |
   | [Ver +]     |  | [Ver +]     |  | [Ver +]     |
   +-------------+  +-------------+  +-------------+

[BANNER CTA] "Tem um modelo em mente? [→ Use o Simulador]"

[FAQ DA MODALIDADE]

[WhatsApp FAB] — botão flutuante em mobile
```

### 5.5 Fluxos de Conversão

#### Fluxo A — Visitante → WhatsApp (máx. 5 cliques)

1. Chega na Homepage via Google / Instagram
2. Vê banner hero → clica em "Simular" ou navega para uma categoria
3. Encontra um modelo → clica "Ver Detalhes"
4. Na página do produto → clica "Chamar no WhatsApp"
5. WhatsApp abre com mensagem pré-formatada:
   > *"Olá Fase Sport! Vi o modelo [Nome] e quero um orçamento para [N] conjuntos de [Modalidade]."*

#### Fluxo B — Visitante → Formulário de Orçamento

1. Chega na Homepage ou diretamente na categoria
2. Navega pelos modelos e acessa CTA "Solicitar Orçamento"
3. Preenche formulário multi-step: **Step 1** (Modalidade + Quantidade) → **Step 2** (Personalização) → **Step 3** (Contato)
4. Envia → recebe confirmação por e-mail → equipe Fase recebe notificação

---

## 6. Requisitos Não-Funcionais

| Requisito | Especificação |
|---|---|
| **Performance** | Lighthouse Score > 90 em Performance, Acessibilidade e SEO. LCP < 2.5s. CLS < 0.1. |
| **SEO** | SSR via Next.js para todas as páginas de produto/categoria. Meta tags dinâmicas, Open Graph, Schema.org (Product, BreadcrumbList, LocalBusiness). |
| **Acessibilidade** | WCAG 2.1 AA. Alt texts em todas as imagens. Navegação por teclado. Labels em todos os inputs. |
| **Responsividade** | Breakpoints: 375px (mobile), 768px (tablet), 1024px (desktop), 1440px (wide). Mobile-first. |
| **Segurança** | HTTPS obrigatório. Rate limiting no formulário. Validação server-side em todos os inputs. Sanitização de dados. |
| **Disponibilidade** | SLA de 99.9% (garantido pelo Vercel + Neon). Rollback automático em falha de deploy. |
| **Internacionalização** | Apenas Português (Brasil) na V1. Estrutura preparada para i18n na V2. |
| **Analytics** | Google Analytics 4 + Google Tag Manager. Eventos customizados: clique em WhatsApp, acesso ao simulador, envio de formulário. |

---

## 7. Roadmap

| Fase | Período | Entregas |
|---|---|---|
| Setup & Infra | Semana 1 | Repo, CI/CD, Docker local, Neon DB, R2 Storage, design tokens |
| Design & Componentes Base | Semana 1–2 | Figma/protótipo das páginas principais, componentes base React |
| Homepage V1 | Semana 2–3 | Todas as seções da landing page, responsivo, animações |
| Catálogo de Categorias | Semana 3–4 | Páginas de categoria, grid de produtos, filtros, SEO |
| Páginas de Produto | Semana 4–5 | Página de detalhe do produto, galeria, CTAs |
| Formulário de Orçamento | Semana 5 | Form multi-step, integração WhatsApp, e-mail |
| CMS / Admin | Semana 5–6 | Interface para cadastrar e editar produtos/modelos |
| QA & Otimização | Semana 6–7 | Testes cross-browser, performance, acessibilidade, SEO |
| Deploy Produção | Semana 7–8 | Vercel prod, domínio, SSL, monitoramento |
| V2 — NKS / Simulador Próprio | Futuro | Integração com plataforma NKS, simulador próprio, área do cliente |

---

*Fase Sport · PRD v1.0 · Junho 2025 · Documento confidencial — uso interno*