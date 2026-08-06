# Task 10 — Schemas Zod de artes + testes

**Plano:** `.omo/plans/admin-roles-artes-produtos-grid.md` (todo 10)
**Data:** 2026-08-06
**Commit:** `feat(admin): add art and user Zod schemas`

## O que foi feito

### `src/lib/validations/arts.ts` (novo)

- `ArtUploadSchema` — `{ name: min 2 max 100, description?: max 1000, tagIds: z.array(z.cuid()).default([]) }`
- `ArtUpdateSchema` — `{ name?: min 2 max 100, description?: nullable, tagIds?: z.array(z.cuid()) }`
- `ArtTagSchema` — `{ name: min 2 max 50 }`
- `ART_PREVIEW_MIME` = `["image/png","image/jpeg","image/webp","image/gif"]`
- `ART_ORIGINAL_EXTENSIONS` = `["cdr","svg","pdf","ai","eps","png","jpg","jpeg","webp","gif"]`
- `ART_MAX_ORIGINAL_SIZE` = `20 * 1024 * 1024`
- `ART_MAX_PREVIEW_SIZE` = `10 * 1024 * 1024`

`tagIds` usa `z.cuid()` top-level (estilo Zod v4 do repo, como `z.email()` em auth.ts) — não usa `z.string().cuid()` (deprecado). Mime/extensões são constantes; validação de existência de tags e contra as listas acontece nas rotas (todo 12/13).

### `src/lib/validations/auth.ts` (estendido, sem remover nada existente)

- `UserCreateSchema` — `{ name: min 2 max 100, email: z.email(), password: min 8, role: z.enum(["T1_GERENCIA","T2_VENDEDOR"]) }`
- `UserUpdateSchema` — parcial: `name?`, `role?`, `isActive?` (boolean), `password?` (min 8)
- `LoginSchema`/`LoginInput` intactos.

### `src/__tests__/validations/arts.test.ts` (novo)

- `ArtUploadSchema`: nome curto → error; `tagIds` inválida → error; payload válido → success; default de `tagIds` = `[]`.
- `ArtUpdateSchema`: parcial vazio → success; `description: null` → success; `tagIds` inválida → error.
- `ArtTagSchema`: válido → success; nome 1 char → error; nome > 50 → error.

### `src/__tests__/validations/auth.test.ts` (estendido)

- `UserCreateSchema`: válido → success; papel `T1_GERENCIA` → success; e-mail malformado → error; senha < 8 → error; papel inválido → error; nome 1 char → error.

## Correção fora do escopo (necessária p/ tsc verde)

`src/lib/auth.ts` (todo 3, worker paralelo, arquivo não commitado) usava `AdminRole` na assinatura de `canAccessRoute` sem importar o tipo — erro TS2304. Adicionado `AdminRole` ao import de `@prisma/client` (1 linha). Arquivo permanece sem commit (será commitado pelo todo 3).

## Verificação (saída real)

### `npm run test:unit` (suíte completa)

```
> fase@0.1.0 test:unit
> vitest run


 RUN  v4.1.8 C:/PASTA IMPORTANTE/TESCH_DEV/fase


 Test Files  8 passed (8)
      Tests  66 passed (66)
   Start at  08:12:28
   Duration  11.02s (transform 1.26s, setup 6.65s, import 4.75s, tests 2.84s, environment 5.67s)
```

### `npx tsc --noEmit`

```
TSC_EXIT_0
```

## Arquivos do todo

- `src/lib/validations/arts.ts` (novo)
- `src/lib/validations/auth.ts` (modificado — adiciona UserCreateSchema/UserUpdateSchema)
- `src/__tests__/validations/arts.test.ts` (novo)
- `src/__tests__/validations/auth.test.ts` (modificado — adiciona casos UserCreateSchema)
- `.omo/evidence/task-10-admin-roles-artes-produtos-grid.md` (este arquivo)
