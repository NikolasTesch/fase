# admin-imagens-medidas - Work Plan

## TL;DR (For humans)

**What you'll get:** Três páginas no painel admin: (1) "Tamanhos" — upload de imagem da tabela por categoria, (2) "Modalidades" — upload de foto dos 14 itens da home, (3) "Medidas" — editor de tabelas com medidas reais (Peito, Cintura × P, M, G, GG). Quando o cliente clica em "Guia de Medidas" no produto, abre um modal mostrando a TABELA DE MEDIDAS digitada (números), não mais a imagem fixa. Se o admin não cadastrar a tabela, o modal mostra a imagem como antes.

**Why this approach:** Os dados de medida (Peito 64cm, Cintura 54cm) são mais úteis que uma imagem estática — o admin pode editar, corrigir e manter atualizado. O modal existente é reutilizado, mantendo a UX consistente para o cliente.

**What it will NOT do:** Não altera a homepage. Não adiciona nada inline na página — tudo fica no modal. Não remove o fallback de imagem para tipos de peça sem tabela cadastrada.

**Effort:** Medium
**Risk:** Low — modelo global (sem categoryId), mudanças localizadas
**Decisions to sanity-check:** SizeChart.type = imageKey (mesmo valor usado em SIZE_GUIDE_IMAGES e SPORT_SPECS_MAPPING) para lookup direto.

Your next move: Aprovar o plano para execução.

---

> TL;DR (machine): Medium effort, Low risk — Reverter homepage (2 arquivos) + manter 2 admin pages existentes + criar SizeChart global (JSON columns+rows) + /admin/medidas + modificar SizeGuideModal e product page para exibir tabela no modal.

## Scope
### Must have
- Reverter CategoriesSection.tsx a dados hardcoded (sem props, sem buildSections)
- Reverter page.tsx (sem modalityItems)
- /admin/tamanhos funcional (já implementado)
- /admin/modalidades funcional (já implementado)
- **NOVO** model SizeChart (type @unique, columns/rows como Json) — global, sem categoryId
- **NOVO** seed com tabelas para cada tipo: camisa, short-masc, short-fem, short-suplex, regata, bermuda, agasalho, colete
- **NOVA** API route PATCH/GET para SizeChart
- **NOVA** página /admin/medidas com editor do grid (colunas × linhas)
- **MODIFICAR** SizeGuideModal.tsx: se existir SizeChart para o imageKey → renderiza tabela, senão → fallback imagem
- **MODIFICAR** [produto]/page.tsx: buscar todos SizeCharts, passar chart correspondente para cada SizeGuideModal
- **NOVO** link "Medidas" na sidebar admin

### Must NOT have (guardrails, anti-slop, scope boundaries)
- NÃO remover /admin/tamanhos (sizeTableUrl) — é complementar
- NÃO alterar CategoriesSection além de reverter ao hardcoded
- NÃO criar relação SizeChart com Category (global, sem categoryId)
- NÃO adicionar tamanhos inline na página — somente dentro do modal (SizeGuideModal)
- NÃO modificar outras páginas admin existentes não relacionadas

## Verification strategy
- Test decision: tests-after (type-check + revisão visual)
- Evidence: .omo/evidence/

## Execution strategy
### Parallel execution waves
Wave 1: Reverter CategoriesSection.tsx + page.tsx (paralelos)
Wave 2: Verificar admin pages existentes (tamanhos + modalidades)
Wave 3: Model + Seed + API routes
Wave 4: Admin page /admin/medidas
Wave 5: Frontend component + integração na página do produto

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. Reverter CategoriesSection | — | — | 2 |
| 2. Reverter page.tsx | — | — | 1 |
| 3. Verificar /admin/tamanhos | — | — | 4 |
| 4. Verificar /admin/modalidades | — | — | 3 |
| 5. Model SizeChart + Seed | — | 6, 7 | 1, 2 |
| 6. API SizeChart | 5 | 7 | — |
| 7. Admin page /admin/medidas | 5, 6 | — | 8, 9 |
| 8. Modificar SizeGuideModal | — | 9 | 7 |
| 9. Integrar produto | 5, 8 | — | 7 |
| 10. Sidebar link | — | — | 3, 4 |

## Todos

- [x] 1. Reverter CategoriesSection.tsx ao estado hardcoded original
  What to do / Must NOT do: Substituir o conteúdo atual (buildSections, CategoryItemData interface, items prop, useMemo) pelo array MODALITY_SECTIONS original com dados fixos. NÃO alterar o layout visual. O arquivo atual está em src/components/sections/CategoriesSection.tsx com import useMemo (linha 3), CategoryItemData (24-36), buildSections (38-90), CategoriesSection({ items }) (211-238). Reverter para: apenas useState, array MODALITY_SECTIONS, export CategoriesSection() sem props.
  References: src/components/sections/CategoriesSection.tsx (linhas 1-239 atuais)
  Acceptance criteria: `npx tsc --noEmit` passa. Componente não importa `useMemo` nem `prisma`.
  QA scenarios: `npx tsc --noEmit` + verificar que import useMemo foi removido. Evidence .omo/evidence/task-1.md
  Commit: Y | fix(admin): revert CategoriesSection to hardcoded data

- [x] 2. Reverter page.tsx ao estado original
  What to do / Must NOT do: Remover modalityItems do Promise.all (linhas 18, 48-51), do retorno (linha 54, 62), da desestruturação (linha 68), do JSX (linha 101 — CategoriesSection volta a ser <CategoriesSection /> sem prop).
  References: src/app/(marketing)/page.tsx (linhas 1-116 atuais)
  Acceptance criteria: `npx tsc --noEmit` passa. getHomepageData retorna 4 propriedades.
  QA scenarios: `npx tsc --noEmit`. Evidence .omo/evidence/task-2.md
  Commit: Y | fix(admin): revert page.tsx modalityItems query

- [x] 3. Verificar página /admin/tamanhos
  What to do / Must NOT do: Confirmar que page.tsx, SizeTableRow.tsx, API routes, e sidebar link estão íntegros. NÃO modificar nada.
  References: src/app/(admin)/admin/tamanhos/**, src/app/api/admin/categories/size-table/route.ts, src/app/api/admin/categories/[id]/route.ts, AdminSidebarClient.tsx
  Acceptance criteria: `npx tsc --noEmit` passa. Evidence .omo/evidence/task-3.md
  Commit: N (já implementado)

- [x] 4. Verificar página /admin/modalidades
  What to do / Must NOT do: Confirmar que page.tsx, ModalitySectionCard.tsx, API routes, e sidebar link estão íntegros. NÃO modificar nada.
  References: src/app/(admin)/admin/modalidades/**, src/app/api/admin/modalities/**, AdminSidebarClient.tsx
  Acceptance criteria: `npx tsc --noEmit` passa. Evidence .omo/evidence/task-4.md
  Commit: N (já implementado)

- [x] 5. Adicionar model SizeChart (global, sem categoryId) ao Prisma + seed data
  What to do:
    a. Adicionar model SizeChart ao prisma/schema.prisma. Model SEM categoryId — é global por tipo de peça:
       ```prisma
       model SizeChart {
         id        String   @id @default(cuid())
         type      String   @unique // "camisa", "short-masc", "short-fem", "short-suplex", "regata", "bermuda", "agasalho", "colete"
         title     String   // "Camisa", "Short Masculino", "Regata", etc.
         columns   Json     // ["Peito (cm)", "Cintura (cm)", "Comprimento (cm)", "Manga (cm)"]
         rows      Json     // [{"label":"P","values":["64","54","70","20"]}, ...]
         createdAt DateTime @default(now())
         updatedAt DateTime @updatedAt
       }
       ```
    b. Rodar `npx prisma generate`
    c. Adicionar seed em prisma/seed.ts com tabelas realistas para CADA tipo (type = imageKey):
       - `camisa`: P/M/G/GG × Peito/Cintura/Comprimento/Manga
       - `short-masc`: P/M/G/GG × Cintura/Comprimento
       - `short-fem`: P/M/G/GG × Cintura/Comprimento/Quadril
       - `short-suplex`: P/M/G/GG × Cintura/Comprimento
       - `regata`: P/M/G/GG × Peito/Cintura/Comprimento
       - `bermuda`: P/M/G × Cintura/Comprimento/Barra
       - `agasalho` (NOVO type precisará ser adicionado no mapping — ver referência): P/M/G/GG × Peito/Cintura/Comprimento/Manga
       - `colete` (NOVO type): P/M/G/GG × Peito/Cintura/Comprimento
    d. NÃO usar categoryId — tabelas são globais. O type deve corresponder exatamente ao imageKey usado em SizeGuideModal.SIZE_GUIDE_IMAGES e ProductSpecifications.SPORT_SPECS_MAPPING.
  References: prisma/schema.prisma (após model AdminUser), SizeGuideModal.tsx:13-20 (SIZE_GUIDE_IMAGES keys), ProductSpecifications.tsx guides (imageKey)
  Acceptance criteria: `npx prisma generate` + `npx tsc --noEmit` passam. Seed insere tabelas para cada type.
  QA scenarios: `npx prisma generate` + `npx tsc --noEmit`. Evidence .omo/evidence/task-5.md
  Commit: Y | feat(admin): add SizeChart model (global by type) and seed

- [x] 6. Criar API routes para SizeChart
  What to do:
    a. Criar src/app/api/admin/size-charts/route.ts:
       - GET: listar TODOS size-charts (sem filtro de categoria — global), ordenado por type
       - POST: upsert/criar size chart (type, title, columns[], rows[])
       - Validar com Zod: type string min1, title string, columns string[] min1, rows array min1
    b. Criar src/app/api/admin/size-charts/[type]/route.ts:
       - GET: retornar size chart por type
       - PATCH: atualizar columns, rows, title de um type existente
       - DELETE: remover size chart por type
    c. Zod schema para validar que rows têm o mesmo número de values que columns.length
  References: src/app/api/admin/categories/[id]/route.ts (Zod pattern), src/app/api/admin/categories/route.ts
  Acceptance criteria: `npx tsc --noEmit` passa. GET retorna lista, PATCH atualiza, DELETE remove.
  QA scenarios: `npx tsc --noEmit`. Evidence .omo/evidence/task-6.md
  Commit: Y | feat(admin): add SizeChart API routes

- [x] 7. Criar página /admin/medidas com editor de grid
  What to do:
    a. Server page src/app/(admin)/admin/medidas/page.tsx:
       - fetch ALL size charts via prisma (sem filtro)
       - passar para client component
    b. Client component src/app/(admin)/admin/medidas/_components/SizeChartTableEditor.tsx:
       - Exibe cards lado a lado, UM para cada type existente
       - Cada card: mostra o grid (tabela preview) + botão "Editar"
       - Modal de edição com:
         - Campo title (texto)
         - Colunas: lista de strings (editable, adicionar, remover)
         - Linhas: cada linha = label (P/M/G/GG) + inputs para cada coluna
         - Botões: "+ Coluna", "+ Linha", "Salvar", "Excluir"
       - Botão "Novo" para criar chart de um type que ainda não existe (dropdown com tipos disponíveis)
    c. Grid visual: input de texto para cada célula, seguindo linhas × colunas
    d. Usar Dialog do shadcn/ui para o editor
  References: src/app/(admin)/admin/medidas/ (criar dir + _components/), SizeGuideModal.tsx (types existentes)
  Acceptance criteria: `npx tsc --noEmit` passa. Editor permite adicionar/editar colunas e linhas. Salvar persiste no banco.
  QA scenarios: `npx tsc --noEmit`. Evidence .omo/evidence/task-7.md
  Commit: Y | feat(admin): add size chart management page with grid editor

- [x] 8. Modificar SizeGuideModal.tsx para aceitar chartData e renderizar tabela
  What to do:
    a. Modificar props de SizeGuideModal para aceitar opcionalmente `chartData: { columns: string[], rows: { label: string, values: string[] }[] } | null`:
       ```tsx
       interface SizeGuideModalProps {
         label: string;
         imageKey: string;
         chartData?: { columns: string[]; rows: { label: string; values: string[] }[] } | null;
       }
       ```
    b. Se chartData existir → renderizar TABLE HTML dentro do DialogContent (em vez do Image):
       - Cabeçalho: coluna vazia + columns
       - Linhas: label + values
       - Styling: table-auto w-full text-sm, border-collapse, th/td com borda e padding
    c. Se chartData for null → manter comportamento atual (mostrar imagem de SIZE_GUIDE_IMAGES)
    d. NÃO alterar a estrutura do Dialog, DialogTrigger ou DialogTitle
  References: src/components/products/SizeGuideModal.tsx (linhas 1-52 atuais)
  Acceptance criteria: `npx tsc --noEmit` passa. Modal renderiza tabela se chartData presente, imagem se null.
  QA scenarios: `npx tsc --noEmit`. Evidence .omo/evidence/task-8.md
  Commit: Y | feat(products): update SizeGuideModal to render chart table

- [x] 9. Integrar SizeCharts na página do produto
  What to do:
    a. Em src/app/(marketing)/[categoria]/[produto]/page.tsx:
       - No escopo da página (fora da query do product), buscar ALL sizeCharts:
         ```tsx
         const sizeCharts = await prisma.sizeChart.findMany();
         ```
       - Criar um Map para lookup rápido: `const chartByType = new Map(sizeCharts.map(sc => [sc.type, sc]));`
       - Passar chartData para cada SizeGuideModal existente. Atualmente ProductSpecifications é chamado em:
         ```tsx
         <ProductSpecifications categorySlug={category.slug} fabric={product.fabric} minQty={product.minQty} />
         ```
       - ProductSpecifications.tsx PRECISA receber os charts e repassar para cada SizeGuideModal. Modificar interface:
         ```tsx
         interface ProductSpecificationsProps {
           categorySlug: string;
           fabric?: string | null;
           minQty?: number | null;
           chartByType?: Map<string, { columns: string[], rows: { label: string, values: string[] }[] }>;
         }
         ```
       - Em ProductSpecifications.tsx, ao renderizar SizeGuideModal, passar chartData:
         ```tsx
         <SizeGuideModal
           key={guide.imageKey}
           label={guide.label}
           imageKey={guide.imageKey}
           chartData={chartByType?.get(guide.imageKey) ?? null}
         />
         ```
    b. Tratar tipagem do JSON: `sc.columns as string[]`, `sc.rows as { label: string; values: string[] }[]`
  References: src/app/(marketing)/[categoria]/[produto]/page.tsx (linhas 45-168), ProductSpecifications.tsx (linhas 133-177), SizeGuideModal.tsx
  Acceptance criteria: `npx tsc --noEmit` passa. Produtos com size charts exibem tabela no modal.
  QA scenarios: `npx tsc --noEmit`. Evidence .omo/evidence/task-9.md
  Commit: Y | feat(products): integrate size charts into product page SizeGuideModal

- [x] 10. Adicionar link "Medidas" na sidebar admin
  What to do: Adicionar ao array NAV em AdminSidebarClient.tsx: `{ href: "/admin/medidas", label: "Medidas", icon: Ruler }`, entre Tamanhos e Modalidades. Importar Ruler (já importado) ou Table2.
  References: src/app/(admin)/_components/AdminSidebarClient.tsx
  Acceptance criteria: `npx tsc --noEmit` passa. Sidebar exibe Medidas com ícone.
  QA scenarios: `npx tsc --noEmit`. Evidence .omo/evidence/task-10.md
  Commit: Y | feat(admin): add Medidas link to sidebar

## Final verification wave
- [x] F1. Plan compliance audit: todos os 10 itens conforme escopo
- [x] F2. TypeScript: `npx tsc --noEmit` passa sem erros
- [x] F3. Real manual QA: visitar /admin/tamanhos, /admin/modalidades, /admin/medidas; testar upload e edição
- [x] F4. Scope fidelity: nenhuma mudança não solicitada foi introduzida

## Commit strategy
- fix(admin): revert CategoriesSection to hardcoded data
- fix(admin): revert page.tsx modalityItems query
- feat(admin): add SizeChart model (global by type) and seed data
- feat(admin): add SizeChart API routes
- feat(admin): add size chart management page with grid editor
- feat(products): update SizeGuideModal to render chart table
- feat(products): integrate size charts into product page SizeGuideModal
- feat(admin): add Medidas link to sidebar

## Success criteria
- CategoriesSection.tsx voltou a dados hardcoded (sem props, sem buildSections)
- page.tsx sem modalityItems
- /admin/tamanhos funcional (sizeTableUrl por categoria)
- /admin/modalidades funcional (14 itens com upload)
- /admin/medidas funcional (editor de grid com colunas × linhas)
- SizeGuideModal renderiza tabela de medidas quando chartData existe, fallback imagem quando não
- Produto (ex: /futebol/kit-futebol-campo) → clica "Guia de Medidas Camisa" → modal mostra tabela com Peito/Cintura/Comprimento × P/M/G/GG
- Sidebar admin: Tamanhos, Medidas, Modalidades
- TypeScript compila sem erros
