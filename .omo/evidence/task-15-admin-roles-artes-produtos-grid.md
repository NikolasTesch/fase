# Evidence — Task 15: /admin/produtos em grade (substituir tabela)

**Plan:** `.omo/plans/admin-roles-artes-produtos-grid.md` (todo 15, linhas 452-466)
**Commit:** `feat(admin): replace products table with image-focused grid`
**Date:** 2026-08-06

## Changes

| File | Action |
|---|---|
| `src/app/(admin)/admin/(t1)/produtos/page.tsx` | Modified |
| `src/app/(admin)/admin/(t1)/produtos/_components/ProductGridAdmin.tsx` | Created |
| `src/app/(admin)/admin/(t1)/produtos/_components/AnimatedTableRows.tsx` | Deleted |

> Nota de caminho: o plano omite `(t1)`; caminhos reais usam `src/app/(admin)/admin/(t1)/produtos/...` (todo 4).

## What was done

1. **page.tsx** — query mantida (`orderBy` categoria/sortOrder + `images: { where: { isPrimary: true }, take: 1 }`) e ampliada com `fabric`, `minQty` (mais `id/name/isActive/isFeatured`). Como Prisma não permite misturar `include` e `select` no mesmo nível, o `include` foi convertido em `select` equivalente (mesma semântica: categoria com `name`, imagem primária com `url/altText`). `<AnimatedTableRows products={products} />` trocado por `<ProductGridAdmin products={products} />`. Header, botão "Novo Produto" e estado vazio (ícone `Package`, CTA "Cadastrar primeiro produto") mantidos.
2. **ProductGridAdmin.tsx** (`"use client"`) — props tipadas `{ id, name, fabric, minQty, isActive, isFeatured, category: { name }, images: { url, altText }[] }[]`; grid `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`; stagger framer-motion igual ao AnimatedTableRows (`initial {opacity:0,y:8}`, `delay: i*0.04`, `duration:0.25`, `easeOut`); imagem primária `aspect-square object-cover` com hover `scale-105`; fallback inicial do nome (`bg-muted`, primeira letra uppercase); pills reaproveitadas do AnimatedTableRows: status emerald "Ativo"/muted "Inativo", destaque amber (estrela `fill-current`) "Destaque", categoria muted, tecido outline accent, `Mín. {minQty}`; link "Editar" → `/admin/produtos/{id}`.
3. **AnimatedTableRows.tsx** deletado — sem referências restantes em código (único consumidor era o page.tsx; menção em spec.md é documentação, fora do escopo).

## Verification

```
$ npm run type-check
> tsc --noEmit
src/app/(admin)/admin/(t1)/usuarios/page.tsx(5,32): error TS2307: Cannot find module './_components/UsuariosClient'
```

**Exit code:** 1 (NÃO verde) — porém o único erro é **pré-existente e fora do escopo desta task**:
`src/app/(admin)/admin/(t1)/usuarios/page.tsx` é um arquivo untracked (`??` no git status, LastWriteTime 08:57, antes desta task) deixado por outro todo do plano (página de Usuários, que referencia um `UsuariosClient` nunca criado). Nenhum erro em `produtos/` — os arquivos desta task compilam limpos (`tsc` não reporta nenhum erro em `page.tsx` nem `ProductGridAdmin.tsx`; remoção do AnimatedTableRows não gera referência quebrada).

**Prova de que não é causado por esta mudança:** o arquivo não está no diff desta task (dir untracked, criado antes), e `git log` mostra commits anteriores de usuários API/sidebar sem este componente.

## QA scenarios

- happy: grade de cards renderiza; "Editar" navega para `/admin/produtos/{id}` (href mantido).
- failure: produto sem imagem → placeholder com inicial do nome (não quebra) — coberto pelo fallback `bg-muted` + `p.name[0]`.

## Scope guard

- ProductForm.tsx, /admin/produtos/novo, [id]: não tocados.
- Slugs/rotas: inalterados. Sem `as any` / `@ts-ignore`.
- Fora do escopo não tocado: chat/RAG, WhatsAppFab, analytics, API routes, `usuarios/`, `api/admin/arts/` (todos de outros todos).

## Follow-up necessário (bloqueador pré-existente)

O type-check global só ficará verde quando o todo da página de Usuários criar `src/app/(admin)/admin/(t1)/usuarios/_components/UsuariosClient.tsx`.
