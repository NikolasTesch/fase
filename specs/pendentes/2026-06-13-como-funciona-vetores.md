# Homepage/Marketing: Melhoria da Seção "Como Funciona" com 6 Passos Vetoriais

> **Status:** `pendente`
> **ID:** `2026-06-13-como-funciona-vetores`
> **Criada em:** 2026-06-13
> **Agente:** arquiteto

---

## Contexto

A seção "Como Funciona" (atualmente implementada de forma simplificada em 3 passos na Homepage em `HowItWorksSection.tsx` e em 4 passos na página interna em `ProcessSteps.tsx`) precisa ser aprimorada para refletir com precisão a jornada real de atendimento e confecção de uniformes da Fase Sport. 

Seguindo a referência visual fornecida, iremos expandir o fluxo para **6 etapas consecutivas**, substituindo os ícones de biblioteca genéricos por **vetores inline customizados (SVGs)** que reproduzem o estilo visual premium da marca. Além disso, estruturaremos os dados em vetores (arrays) ricos com mais campos para habilitar interatividade, suporte a acessibilidade e links diretos para ações (como chamar no WhatsApp ou acessar o simulador).

---

## Objetivos

- [ ] Unificar os componentes de passos (`ProcessSteps.tsx` e `HowItWorksSection.tsx`) em uma estrutura rica baseada em vetores de 6 passos.
- [ ] Adicionar novos campos a cada passo no vetor de configuração:
  - `stepNumber`: string representativa (ex: `"01"`, `"02"`)
  - `title`: título em caixa alta (ex: `"SOLICITE O ATENDIMENTO"`)
  - `description`: explicação detalhada para SEO/acessibilidade
  - `link`: link opcional de conversão ou destino (ex: `/orcamento`, WhatsApp, etc.)
  - `actionText`: texto do botão ou link da ação
  - `iconSvg`: componente SVG vetorizado customizado
- [ ] Implementar a timeline horizontal em desktop inspirada na imagem de referência:
  - Divisórias verticais sutis entre cada etapa.
  - Indicadores de fluxo (setas vetorizadas na cor da marca) apontando para a etapa seguinte.
  - Alinhamento horizontal equilibrado dos 6 passos.
- [ ] Garantir responsividade premium (mobile-first):
  - Em telas desktop (`lg` e superior): layout horizontal de 6 colunas conectadas com setas e divisores.
  - Em telas tablet (`md`): layout em grid de 3 colunas e 2 linhas.
  - Em telas mobile (`sm` e inferior): timeline vertical ou grid de 1 coluna com setas indicativas para baixo para garantir leitura natural sem scroll horizontal forçado.
- [ ] Customizar e incorporar os 6 vetores SVG inline:
  - **Passo 1:** Atendimento (balão de conversa + telefone / WhatsApp)
  - **Passo 2:** Personalização (manto/camiseta esportiva estilizada)
  - **Passo 3:** Pagamento (mão recebendo/segurando moeda de dólar)
  - **Passo 4:** Produção (máquina de costura)
  - **Passo 5:** Prazos (calendário com marcação/check)
  - **Passo 6:** Entrega (caminhão de frete com linhas de movimento)

---

## Fora de escopo

- Painel administrativo para cadastro dinâmico das etapas (permanecerão configuradas localmente no vetor do frontend para garantir performance máxima, em conformidade com o escopo V1 da landing page).
- Integração de gateway de pagamento na etapa de pagamento (trata-se de um catálogo instrucional, o pagamento é combinado e finalizado de forma humana).

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/components/sections/ProcessSteps.tsx` | modificar | Atualizar para o novo layout de 6 passos com vetores inline, divisores, setas indicativas e suporte a links interativos. |
| `src/components/sections/HowItWorksSection.tsx` | modificar | Ajustar para reutilizar o layout de 6 passos ou importar o componente `ProcessSteps` de forma parametrizada. |
| `src/app/(marketing)/como-funciona/page.tsx` | modificar | Garantir que a renderização da página interna de processo utilize a nova estrutura com descrições ricas. |
| `src/app/(marketing)/page.tsx` | modificar | Garantir a renderização fluida e performática da nova timeline de 6 passos na home. |

### Vetor de Dados (Estrutura de 6 Passos)

O array de configuração conterá os seguintes campos e dados:

```typescript
interface StepItem {
  stepNumber: string;
  title: string;
  description: string;
  link?: string;
  actionText?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const PROCESS_STEPS: StepItem[] = [
  {
    stepNumber: "01",
    title: "SOLICITE O ATENDIMENTO",
    description: "Inicie o contato com nossa equipe comercial pelo WhatsApp para tirar dúvidas e alinhar seu pedido.",
    link: "whatsapp", // sentinela — resolver via buildWhatsAppUrl() de src/lib/site.ts
    actionText: "Falar no WhatsApp",
    icon: PhoneChatIcon,
  },
  {
    stepNumber: "02",
    title: "PERSONALIZE SEU UNIFORME",
    description: "Escolha as cores, insira o escudo do seu time, patrocínios, nomes e números de forma personalizada.",
    link: "simulator", // sentinela — resolver via getSimulatorUrl() de src/lib/site.ts; ocultar ação se retornar null
    actionText: "Ir para o Simulador",
    icon: JerseyIcon,
  },
  {
    stepNumber: "03",
    title: "ESCOLHA A FORMA DE PAGAMENTO",
    description: "Facilitamos o pagamento com opções flexíveis de sinal + saldo na entrega ou parcelamento.",
    icon: PaymentIcon,
  },
  {
    stepNumber: "04",
    title: "AUTORIZE O INÍCIO DA PRODUÇÃO",
    description: "Após aprovar o layout final em 3D e confirmar os tamanhos, iniciamos a confecção dos mantos.",
    icon: SewingMachineIcon,
  },
  {
    stepNumber: "05",
    title: "ESPERE OS PRAZOS ESTIPULADOS",
    description: "Nossa fábrica trabalha com cronograma rígido para entregar seus uniformes dentro do prazo acordado.",
    icon: CalendarCheckIcon,
  },
  {
    stepNumber: "06",
    title: "O PRODUTO CHEGARÁ EM SEU DESTINO",
    description: "Enviamos para todo o Brasil com segurança ou disponibilizamos retirada física em Colatina-ES.",
    icon: DeliveryTruckIcon,
  },
];
```

### Vetores SVG Inline Customizados

Para evitar dependências externas e garantir conformidade visual exata com a imagem, criaremos componentes funcionais de React para cada ícone SVG com viewBox apropriado (`0 0 24 24` ou similar), `strokeWidth={2}` e suporte a estilização via classes Tailwind (`stroke-current`, `text-primary`):

1. **PhoneChatIcon (Passo 1):** Um balão de conversa com um telefone clássico de linha em estilo outline.
2. **JerseyIcon (Passo 2):** Um uniforme/camiseta esportiva contendo detalhes como gola V e listras laterais.
3. **PaymentIcon (Passo 3):** Uma mão estilizada na horizontal segurando uma moeda redonda contendo o símbolo `$`.
4. **SewingMachineIcon (Passo 4):** Uma máquina de costura clássica contendo o cabeçote, carretel de linha superior e agulha.
5. **CalendarCheckIcon (Passo 5):** Um calendário em formato de grade com as linhas superiores em espiral e um símbolo check (visto) destacado.
6. **DeliveryTruckIcon (Passo 6):** Um caminhão baú de entregas com 3 linhas de movimento dinâmico horizontais na parte traseira.

### Layout e Estilização Tailwind CSS

Para reproduzir a identidade visual mostrada na referência:
- **Cor:** Os ícones e setas indicadoras devem adotar a cor de destaque da marca (`var(--primary)` ou `#CD3438`) com fundo suave/transparente.
- **Divisórias e Conexão:** 
  - Divisórias verticais entre as colunas usando borda sutil (`border-zinc-200` ou similar).
  - Setas puras em SVG apontando para a direita (`▶`) inseridas de forma absoluta ou flexível entre os passos.
- **Micro-interações:** Hover nos cards gera elevação suave e mudança do contorno da moeda/ícone para dar feedback de interatividade.

---

## Decisões técnicas (ADR)

**ADR-15 — Unificação e Parametrização do Componente de Passos:**
Em vez de mantermos dois componentes de etapas ligeiramente diferentes (`HowItWorksSection` e `ProcessSteps`), iremos refatorar `ProcessSteps.tsx` para se tornar a fonte única de verdade do passo a passo. Ele aceitará uma propriedade opcional (ex: `variant?: "simple" | "detailed"`) para exibir descrições apenas onde necessário (como na página interna) e manter o layout limpo e direto nas páginas menores ou Homepage, reduzindo a duplicação de código.

**ADR-16 — Vetores SVG Hardcoded em Código para Performance:**
A renderização direta de SVGs inline é mais performática que o carregamento dinâmico de arquivos externos ou o uso de webfonts. Os ícones serão declarados como componentes auxiliares internos em `ProcessSteps.tsx` ou em uma pasta `components/ui/icons/` dedicada a vetores fixos, reduzindo as requisições de rede.

---

## Checklist de Implementação

- [ ] 1. Desenhar ou obter os paths SVG limpos e precisos dos 6 ícones representados na imagem:
  - Balão + Telefone (Atendimento)
  - Camiseta de futebol listrada (Personalização)
  - Mão segurando moeda `$` (Pagamento)
  - Máquina de costura (Produção)
  - Calendário com check (Prazos)
  - Caminhão com velocidade (Entrega)
- [ ] 2. Implementar os ícones como componentes React em **`src/components/ui/icons.tsx`** (destino único para todos os ícones custom do projeto — não duplicar inline no componente de passos).
- [ ] 3. Criar a estrutura rica de dados `PROCESS_STEPS` contendo os novos campos adicionais (`stepNumber`, `title`, `description`, `link`, `actionText`, `icon`).
- [ ] 4. Atualizar o componente `src/components/sections/ProcessSteps.tsx` com o layout de 6 colunas, divisores de borda sutil, setas vetorizadas e suporte a interatividade/responsividade.
- [ ] 5. Ajustar o componente `src/components/sections/HowItWorksSection.tsx` para importar `ProcessSteps` ou adotar o mesmo design unificado de 6 passos.
- [ ] 6. Revisar as páginas `como-funciona/page.tsx` e `page.tsx` (Homepage) para garantir a correta renderização e ausência de problemas de tipagem ou layout.
- [ ] 7. Validar acessibilidade (leitura correta em leitores de tela via `aria-label` e focabilidade das etapas com links).
- [ ] 8. Testar a responsividade em dispositivos móveis, garantindo que as setas mudem de direção (apontando para baixo) ou que o grid mude elegantemente sem quebrar o alinhamento.
- [ ] 9. Executar build local (`npm run build`) para verificar integridade estática do TypeScript e Next.js.

---

## Critérios de Aceitação

- [ ] A seção exibe exatamente as 6 etapas na ordem correta, com ícones vetoriais inline limpos e bem dimensionados.
- [ ] O visual em desktop reproduz fielmente o alinhamento horizontal com divisores e setas apontando para a direita entre os passos.
- [ ] O layout é totalmente responsivo, mudando de 6 colunas em desktop para grids menores ou listagem vertical em celulares, sem cortes laterais ou overflow de tela.
- [ ] Os links interativos ("Solicite o atendimento" direcionando para o WhatsApp e "Personalize seu uniforme" para o simulador ou formulário) funcionam corretamente.
- [ ] O projeto compila com sucesso via `npm run build` e passa nas verificações estáticas de linting.

---

## Notas

- **Cores da Marca:** Garantir o uso estrito de `--primary` (vermelho Fase) para as setas e detalhes das bordas de ícone, mantendo a consistência do design system estabelecida no `globals.css` (ADR-5).
- **Acessibilidade:** Etapas informativas simples (sem links) não devem ser focáveis por tabulação, enquanto etapas interativas devem possuir estados de foco visíveis e `role="link"`.
- **Resolução de sentinelas no componente:** o implementador deve resolver `link: "whatsapp"` → `buildWhatsAppUrl()` e `link: "simulator"` → `getSimulatorUrl()`, ambas importadas de `src/lib/site.ts`. Quando `getSimulatorUrl()` retornar `null` (variável de ambiente ausente), omitir o botão de ação do passo 2.
- **Server vs. Client:** `ProcessSteps` pode permanecer Server Component se as micro-interações de hover forem feitas via CSS. Converter para `"use client"` apenas se for necessário estado interativo (ex: accordion por passo).
