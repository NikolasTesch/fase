# Marketing/Catalogo: Reestruturação da Página de Detalhe do Produto

> **Status:** `pendente`
> **ID:** `2026-06-13-detalhe-produto-linhas`
> **Criada em:** 2026-06-13
> **Agente:** arquiteto

---

## Contexto

A página atual de detalhe do produto (`[produto]/page.tsx`) apresenta uma estrutura simplificada: apenas galeria de fotos, título, tecido, quantidade mínima, descrição curta e os botões de CTA. 

Para uniformes esportivos personalizados, o cliente precisa de informações muito mais específicas e detalhadas no momento da decisão (quais itens compõem o kit, opções de personalização de gola/escudo/punho, acesso rápido às tabelas de medidas e diferenciação técnica das linhas de produção da fábrica). 

Reformularemos a página de detalhe do produto para:
1. **Adicionar Ficha Técnica de Confecção:** Detalhamento específico na coluna da direita para as peças que compõem o modelo (ex: Camisa, Short, Meião) com suas respectivas especificações e um ícone de régua apontando para o Guia de Medidas.
2. **Guia de Medidas Interativo:** Popups (modais) ou links diretos para imagens das tabelas de medidas hospedadas no R2/public.
3. **Seção de Linhas Esportivas e Processo de Compra:** Uma nova seção de largura total na parte inferior da página, detalhando as diferenças entre as linhas *Prata*, *Ouro* e *Profissional*, e relembrando as etapas do processo de pedido.

---

## Objetivos

- [ ] Criar o componente `ProductSpecifications.tsx` para renderizar a ficha técnica de personalização na coluna direita do produto com base na modalidade/categoria:
  - **Futebol/Vôlei/Handebol:** Divide-se em "Camisa" (Tecnologia Dry, Escudo Sublimado/Bordado/Patch, Cores, Gola, Punho, Patrocinadores, Nome/Número, Selo Oficial), "Short" (Tecnologia Dry, Escudo, Número, Viés) e "Meião" (Profissional vs Amador).
  - **Basquete:** Divide-se em "Regata" (Corte Americano, Dry-fit, Escudo, Cores, Patrocinadores, Nome/Número, Cavas e Gola reforçadas) e "Bermuda" (Cordão de ajuste, Bolsos opcionais, Dry-fit).
  - **Coletes/Passeio/Agasalhos/Outros:** Detalhamento específico das peças e modelagens equivalentes. Caso a categoria não esteja mapeada no dicionário estático, o componente deve utilizar uma ficha técnica genérica baseada nos campos gerais do produto (Tecido, Qtd Mínima e descrição), exibindo um Guia de Medidas geral.
- [ ] Implementar os links "Guia de Medidas" (com ícone de régua) para as peças correspondentes. Ao clicar, abre-se um modal premium (`SizeGuideModal.tsx`) renderizando a tabela de medidas de forma responsiva e com zoom, sem tirar o usuário da página. As tabelas serão imagens hospedadas:
  - Camisa: `/images/size-guides/tabela-camisa.png`
  - Short Masculino: `/images/size-guides/tabela-short-masc.png`
  - Short Feminino: `/images/size-guides/tabela-short-fem.png`
  - Short Suplex: `/images/size-guides/tabela-short-suplex.png`
  - Regata Basquete: `/images/size-guides/tabela-regata.png`
- [ ] Criar o componente de largura total `LinesAndProcessSection.tsx` na parte inferior da página contendo:
  - **Tabela Comparativa de Linhas:** Prata (conforto e economia), Ouro (alta definição e durabilidade) e Profissional (materiais combinados, cortes dry e alta performance).
  - **Infográfico de Processo de Compra:** Resumo visual em 6 etapas rápidas ("Solicitar", "Personalizar", "Pagar", "Produzir", "Aguardar", "Receber").

---

## Fora de escopo

- Configuração individual de especificações de confecção no banco de dados por produto na V1 (será estruturado por meio de mapeamentos baseados na categoria do produto no frontend, mantendo o banco leve e a consistência visual).

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/(marketing)/[categoria]/[produto]/page.tsx` | modificar | Integrar o componente de especificações laterais, o modal de guia de tamanhos e a seção de rodapé comparativa de linhas e processo. |
| `src/components/products/ProductSpecifications.tsx` | criar | Ficha técnica de confecção parametrizada por categoria com links de guias de medidas. |
| `src/components/ui/dialog.tsx` | criar | Componente Dialog reutilizável usando `@base-ui/react` (Dialog.Root, Dialog.Trigger, Dialog.Popup, Dialog.Backdrop). **Criar primeiro.** |
| `src/components/products/SizeGuideModal.tsx` | criar | Modal popup para exibição de imagens de tabelas de tamanhos — usa o `dialog.tsx` criado acima. |
| `src/components/products/LinesAndProcessSection.tsx` | criar | Seção informativa inferior de linhas de produção (Prata/Ouro/Pro) e resumo das 6 etapas de pedido. |
| `public/images/size-guides/` | criar | Pasta para armazenar as imagens das tabelas de medidas de confecção. |

### Configuração de Especificações por Categoria

Criaremos um mapeamento estático das especificações para manter a interface consistente:

```typescript
export const SPORT_SPECS_MAPPING: Record<string, Array<{
  partName: string;
  items: string[];
  guides: Array<{ label: string; imageKey: string }>;
}>> = {
  futebol: [
    {
      partName: "Camisa",
      items: [
        "Tecido com Tecnologia Dry-fit de alta respirabilidade",
        "Escolha entre Escudo Sublimado, Patch Profissional ou Bordado",
        "Personalização livre de cores e designs",
        "Opções de Gola (V, careca, padre ou polo)",
        "Punhos simples ou com ribana contrastante",
        "Inclusão ilimitada de patrocinadores sem custo adicional",
        "Nome individual do atleta e numeração inclusos",
        "Selo de Produto Oficial Fase Sport na barra"
      ],
      guides: [{ label: "Guia de Medidas Camisa", imageKey: "camisa" }]
    },
    {
      partName: "Short",
      items: [
        "Tecido com Tecnologia Dry e cordão interno de ajuste",
        "Escolha entre Escudo Sublimado, Patch Profissional ou Bordado",
        "Numeração individual estampada",
        "Adicione detalhes de acabamento em viés colorido"
      ],
      guides: [
        { label: "Guia de Medidas Short Masculino", imageKey: "short-masc" },
        { label: "Guia de Medidas Short Feminino", imageKey: "short-fem" },
        { label: "Guia de Medidas Short Suplex", imageKey: "short-suplex" }
      ]
    },
    {
      partName: "Meião",
      items: [
        "Escolha entre o Meião Profissional (pé de algodão atoalhado) ou Amador",
        "Punho elástico duplo para evitar deslizamento"
      ],
      guides: []
    }
  ],
  basquete: [
    {
      partName: "Regata",
      items: [
        "Modelagem americana ampla com cavas confortáveis",
        "Tecido Dry-fit de alta gramatura e secagem rápida",
        "Cavas e gola com acabamento em debrum contrastante",
        "Nomes, patrocínios e números sublimados"
      ],
      guides: [{ label: "Guia de Medidas Regata", imageKey: "regata" }]
    },
    {
      partName: "Bermuda",
      items: [
        "Corte longo estilo basquete de rua",
        "Cós elástico largo de 50mm e cordão de ajuste interno",
        "Bolsos laterais opcionais para uso no dia a dia"
      ],
      guides: [{ label: "Guia de Medidas Bermuda", imageKey: "bermuda" }]
    }
  ]
};
```

---

## Decisões técnicas (ADR)

**ADR-23 — Size Guide Modal via @base-ui/react Dialog:**
O projeto usa `@base-ui/react` (não `@radix-ui` nem shadcn). **Não existe** `src/components/ui/dialog.tsx` no repositório. Esta spec inclui a criação desse componente com `Dialog.Root`, `Dialog.Trigger`, `Dialog.Popup` e `Dialog.Backdrop` do `@base-ui/react`, seguindo o mesmo padrão dos demais primitivos do projeto. Apenas após criado, o `SizeGuideModal` poderá importá-lo.

**ADR-24 — Redirecionamento e Backup de Imagem R2:**
Caso a imagem local em `/images/size-guides/...` não esteja presente, utilizaremos um fallback dinâmico para carregar do R2 usando o domínio configurado na variável de ambiente `NEXT_PUBLIC_R2_URL`, garantindo que os guias nunca fiquem indisponíveis se novos modelos forem cadastrados em tempo de execução.

**ADR-30 — Fallback de Ficha Técnica para Outras Modalidades:**
Se o produto pertencer a uma categoria não listada explicitamente no mapeamento (como acessórios, coletes, passeio ou agasalhos), o componente `ProductSpecifications` carregará uma ficha técnica padrão baseada nos atributos gerais do item (por exemplo, exibindo os campos de tecido e quantidade mínima de forma organizada e oferecendo o Guia de Medidas geral da marca), evitando falhas de undefined ou quebras em tempo de execução.

---

## Checklist de Implementação

- [ ] 1. Criar a pasta `public/images/size-guides/` e popular com mockups das tabelas de medidas de camisetas, bermudas masculinas/femininas e coletes.
- [ ] 2. Criar `src/components/ui/dialog.tsx` com `@base-ui/react` (Dialog.Root / Dialog.Trigger / Dialog.Popup / Dialog.Backdrop). Somente depois criar `SizeGuideModal.tsx` importando esse componente.
- [ ] 3. Criar o componente `ProductSpecifications.tsx` com a listagem de itens e os botões/links de régua para os guias de medidas, garantindo suporte a fallback para categorias não listadas.
- [ ] 4. Criar o componente `LinesAndProcessSection.tsx` estruturando a tabela comparativa de linhas (Prata, Ouro, Pro) e a listagem visual do processo de compra.
- [ ] 5. Modificar `src/app/(marketing)/[categoria]/[produto]/page.tsx` para integrar os componentes `ProductSpecifications` na lateral e `LinesAndProcessSection` na base do layout.
- [ ] 6. Garantir que o design se adapte responsivamente, movendo as especificações laterais para baixo da galeria de fotos em telas móveis.
- [ ] 7. Executar `npm run build` e verificar integridade estática do TypeScript e Next.js.

---

## Critérios de Aceitação

- [ ] A página do produto apresenta a ficha técnica detalhada por modalidade com ícones e marcadores elegantes.
- [ ] Clicar no link "Guia de Medidas" abre o modal popup com a respectiva imagem da tabela de tamanhos centralizada e legível.
- [ ] Pressionar `Esc` ou clicar fora do modal fecha o popup corretamente.
- [ ] A seção inferior (Linhas e Processo) é exibida em largura total e se adapta perfeitamente em telas menores sem gerar quebras de texto.
- [ ] A aplicação compila sem erros estáticos de tipagem ou lint.

---

## Notas

- **Slugs no `SPORT_SPECS_MAPPING`:** o mapeamento atual cobre apenas `futebol` e `basquete`. Adicionar `volei` e `handebol` com especificações equivalentes ao futebol, ou o fallback genérico (ADR-30) será acionado para essas modalidades.
- **Assets de tabelas de medidas:** as imagens em `public/images/size-guides/` não existem ainda. Sem elas, `next/image` retorna 404. Criar placeholders visuais com as dimensões corretas antes de rodar o build de produção.
- **Fallback de imagem (ADR-24):** se `NEXT_PUBLIC_R2_URL` não estiver configurado no ambiente, o fallback ficará vazio. Garantir que a variável exista tanto em desenvolvimento quanto em produção (Neon/Vercel).
