# admin-imagens-medidas — Summary

**Status:** COMPLETE ✅
**TypeScript:** `npx tsc --noEmit` — clean (no errors)

## Files Created

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Model `SizeChart` (type @unique, columns Json, rows Json) |
| `prisma/seed.ts` | Seed com 8 tabelas de medidas realistas |
| `src/app/api/admin/size-charts/route.ts` | GET (list) + POST (upsert) |
| `src/app/api/admin/size-charts/[type]/route.ts` | GET (by type) + PATCH + DELETE |
| `src/app/(admin)/admin/medidas/page.tsx` | Server page (fetch + render) |
| `src/app/(admin)/admin/medidas/_components/MedidasClient.tsx` | Grid editor with modal |

## Files Modified

| File | Change |
|------|--------|
| `src/components/sections/CategoriesSection.tsx` | Reverted to hardcoded MODALITY_SECTIONS |
| `src/app/(marketing)/page.tsx` | Removed modalityItems query and prop |
| `src/components/products/SizeGuideModal.tsx` | Added `chartData` prop, renders table or image |
| `src/components/products/ProductSpecifications.tsx` | Added `chartByType` prop, passes to SizeGuideModal |
| `src/app/(marketing)/[categoria]/[produto]/page.tsx` | Fetches SizeCharts, passes to ProductSpecifications |
| `src/app/(admin)/_components/AdminSidebarClient.tsx` | Added "Medidas" link |

## Admin Pages

| Route | Description |
|-------|-------------|
| `/admin/tamanhos` | Upload de imagem da tabela por categoria (sizeTableUrl) |
| `/admin/modalidades` | Upload de foto p/ 14 itens da seção Modalidades |
| `/admin/medidas` | Editor de grid de medidas (colunas × linhas) |

## Seed Data (8 size charts)

- camisa, short-masc, short-fem, short-suplex, regata, bermuda, agasalho, colete

## Commits (8 suggested)

1. `fix(admin): revert CategoriesSection to hardcoded data`
2. `fix(admin): revert page.tsx modalityItems query`
3. `feat(admin): add SizeChart model and seed data`
4. `feat(admin): add SizeChart API routes`
5. `feat(admin): add size chart management page`
6. `feat(products): update SizeGuideModal to render chart table`
7. `feat(products): integrate size charts into product page`
8. `feat(admin): add Medidas link to sidebar`
