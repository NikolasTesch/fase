---
slug: admin-imagens-medidas
status: awaiting-approval
intent: clear
pending-action: write .omo/plans/admin-imagens-medidas.md
approach: Reverter mudanças da homepage + manter páginas admin de upload de imagem + criar sistema de medidas estruturadas
---

# Draft: admin-imagens-medidas

## Components (topology ledger)
| id | outcome | status | evidence path |
|---|---|---|---|
| CatSection-revert | CategoriesSection.tsx volta a usar dados hardcoded (sem props, sem buildSections) | active | src/components/sections/CategoriesSection.tsx (atual: buildSections + items prop) |
| Page-revert | page.tsx volta a não consultar ModalityItem | active | src/app/(marketing)/page.tsx (atual: modalityItems na query linha 18-51) |
| Admin-tamanhos | Página /admin/tamanhos com upload de sizeTableUrl por categoria | active | Já implementado |
| Admin-modalidades | Página /admin/modalidades com upload de imagem por item | active | Já implementado |
| Admin-medidas | NOVA página /admin/medidas com editor de tabelas de medidas p/ cada tipo de peça | planned | Global: tabelas únicas (camisa, short-masc, etc.) |
| SizeChart-model | NOVO model SizeChart (type @unique, columns Json, rows Json) | planned | type = imageKey (camisa, short-masc, short-fem, regata, bermuda, agasalho, colete) — SEM categoryId |
| SizeChart-seed | Seed com tabelas p/ cada tipo de peça com valores realistas de medida | planned | Ex: camisa tem P/M/G/GG × Peito/Cintura/Comprimento/Manga |
| SizeChart-frontend | SizeGuideModal modificado: se existir SizeChart.type matching → renderiza tabela; senão → fallback imagem hardcoded | planned | Substitui imagem por tabela quando disponível |

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
|---|---|---|---|
| Tabelas de medidas usam JSON no Prisma (columns + rows) | Mais simples que modelo relacional complexo | Dados são inerentemente tabulares, evita 3+ tabelas relacionais | Yes (migrar depois) |
| Medidas aparecem na página do produto dentro da Ficha Técnica | ProductSpecifications já renderiza specs + guias | Local natural, reuso do container visual | Yes |
| Medidas fixas no seed (P/M/G/GG com valores exemplo) | Admin pode editar depois via /admin/medidas | Seed precisa de dados realistas para funcionar | Yes |

## Findings (cited - path:lines)
- CategoriesSection.tsx:3 imports useMemo, 24-36 CategoryItemData interface, 38-90 buildSections(), 211-238 items prop
- page.tsx:18 modalityItems no Promise.all, 48-51 prisma.modalityItem.findMany, 54 retorno, 62 fallback, 68 desestruturação, 101 <CategoriesSection items={}>
- AdminSidebarClient.tsx já tem links para /admin/tamanhos e /admin/modalidades
- ModalityItem model + seed + 14 itens + API routes já criados e funcionais
- sizeTableUrl no Category + API + /admin/tamanhos já criados
- ProductSpecifications.tsx:11-117 mapeia SPORT_SPECS_MAPPING por categoria (futebol: Camisa/Short/Meião, etc.) com guides (imageKey)
- SizeGuideModal.tsx:13-20 SIZE_GUIDE_IMAGES hardcoded (tabela-camisa.png, etc.)
- ProductSpecifications.tsx:164-172 renderiza SizeGuideModal para cada guide

## Decisions (with rationale)
1. **Reverter CategoriesSection ao estado hardcoded original**: usuário pediu "volte as aparições ao estado anterior"
2. **Manter ModalityItem model/seed/API/admin**: usuário confirmou que quer a página admin de modalidades
3. **SizeChart model GLOBAL (sem categoryId)**: usuário quer UMA tabela por tipo de peça (camisa, short-masc, etc.), não por categoria
4. **SizeChart.type = imageKey**: o type corresponde ao imageKey usado em SPORT_SPECS_MAPPING (camisa, short-masc, short-fem, regata, bermuda, short-suplex, agasalho, colete)
5. **Tabela aparece DENTRO do SizeGuideModal**: substitui a imagem hardcoded quando existir SizeChart para aquele type; se não existir, fallback para imagem
6. **Product page busca todos SizeCharts**: passa o chart correspondente para cada SizeGuideModal via prop
7. **Manter /admin/tamanhos como está**: sizeTableUrl (imagem geral por categoria) é complementar

## Scope IN
- Reverter CategoriesSection.tsx e page.tsx ao estado original
- Garantir /admin/tamanhos e /admin/modalidades funcionais
- **CRIAR model SizeChart** (type @unique, columns Json, rows Json) — SEM categoryId
- **CRIAR seed** com tabelas: camisa (P/M/G/GG: Peito/Cint/Comp/Manga), short-masc, short-fem, short-suplex, regata, bermuda, agasalho, colete
- **CRIAR API routes** GET (listar todos), PATCH (atualizar columns+rows de um type), POST (criar novo type se não existir)
- **CRIAR página /admin/medidas** com lista de tabelas (uma por type) e editor inline do grid
- **MODIFICAR SizeGuideModal.tsx** para aceitar prop `chartData: { columns: string[], rows: SizeRow[] } | null` e renderizar tabela HTML ou imagem
- **MODIFICAR [produto]/page.tsx** para buscar SizeCharts e passar a cada SizeGuideModal o chart correspondente ao imageKey
- **ADICIONAR** link "Medidas" na sidebar admin

## Scope OUT (Must NOT have)
- NÃO remover /admin/tamanhos (sizeTableUrl per category)
- NÃO alterar CategoriesSection além de reverter
- NÃO alterar ProductSpecifications.tsx além do necessário (a passagem de chartData para SizeGuideModal)
- NÃO criar relacionamento SizeChart com Category (global, sem categoryId)
- NÃO refatorar admin pages não relacionadas

## Open questions
Nenhuma — usuário já respondeu todas as clarificações.

## Approval gate
status: awaiting-approval
pending-action: write .omo/plans/admin-imagens-medidas.md
