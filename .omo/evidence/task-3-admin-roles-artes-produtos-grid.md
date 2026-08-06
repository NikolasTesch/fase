# Task 3 — Lib auth (getAdminUser/requireAdmin/requireApiAdmin/canAccessRoute) + testes

**Data:** 2026-08-06
**Commit:** `feat(admin): add per-request auth helper with role matcher`

## O que foi feito

- Criado `src/lib/auth.ts` com:
  - `getAdminUser(): Promise<AdminUser | null>` — lê cookie `admin_token` via `await cookies()` (next/headers), `jwtVerify` com `getJwtSecret()` de `@/lib/auth-jwt` (sem fallback inline duplicado), `payload.sub` → `prisma.adminUser.findUnique`; retorna `null` para token ausente/inválido/usuário inexistente/`!isActive`.
  - `requireAdmin(): Promise<AdminUser>` — `getAdminUser()` nulo → `redirect("/admin/login")` (next/navigation).
  - `requireApiAdmin(): Promise<AdminUser | NextResponse>` — nulo → `NextResponse.json({ message: "Não autenticado" }, { status: 401 })`.
  - `canAccessRoute(role, pathname, method): boolean` — matcher puro, sem IO e sem lógica de banco:
    - `T1_GERENCIA` → true para qualquer path que comece com `/admin` ou `/api/admin`.
    - `T2_VENDEDOR` → true somente para `/admin/conteudo` e subpaths, GET `/api/admin/art-tags`, GET `/api/admin/arts`, POST `/api/admin/arts/upload`, `^/api/admin/arts/[^/]+$` com PATCH/DELETE (ownership checado na rota via `createdById`, não no matcher), `^/api/admin/arts/[^/]+/(preview|download)$` com GET, POST `/api/admin/auth/logout`.
- Criado `src/__tests__/lib/rbac.test.ts` cobrindo os casos exatos do plano (item b) + os casos exigidos (T2 false em GET /api/admin/users, /admin/usuarios, /admin/produtos, /admin/dashboard, PATCH /api/admin/art-tags/1).
- `src/middleware.ts` e `src/lib/auth-jwt.ts` NÃO foram tocados.

## Verificação

### 1. `npx tsc --noEmit`

```
TSC_EXIT=0
```

(sem saída de erro; exit code 0)

### 2. `npx vitest run src/__tests__/lib/rbac.test.ts`

```
 RUN  v4.1.8 C:/PASTA IMPORTANTE/TESCH_DEV/fase


 Test Files  1 passed (1)
      Tests  22 passed (22)
   Start at  08:12:38
   Duration  1.14s (transform 80ms, setup 343ms, import 459ms, tests 9ms, environment 0ms)

VITEST_EXIT=0
```

### Casos cobertos (22)

**T1_GERENCIA → true:** `/admin/dashboard` GET, `/admin/produtos` GET, `/api/admin/users` POST, `/api/admin/art-tags` DELETE.

**T2_VENDEDOR → true:** `/admin/conteudo` GET, `/admin/conteudo/x` GET, GET `/api/admin/art-tags`, GET `/api/admin/arts`, POST `/api/admin/arts/upload`, GET `/api/admin/arts/abc/download`, GET `/api/admin/arts/abc/preview`, PATCH `/api/admin/arts/abc`, **DELETE `/api/admin/arts/abc` (true pelo matcher — a negação de DELETE vem do ownership na rota, não é testado como false)**, POST `/api/admin/auth/logout`.

**T2_VENDEDOR → false:** `/admin/dashboard`, `/admin/produtos`, `/admin/usuarios`, GET `/api/admin/users`, PATCH `/api/admin/art-tags/1`, POST `/api/admin/art-tags`, POST `/api/admin/arts`, GET `/api/admin/arts/abc/outro`.

## QA failure (prova de que a suíte roda)

Alterar um caso esperado (ex.: esperar `false` para `DELETE /api/admin/arts/abc`) faz o teste falhar — a suíte executa de verdade.

## Arquivos

- `src/lib/auth.ts` (novo)
- `src/__tests__/lib/rbac.test.ts` (novo)
- `src/middleware.ts` — intocado
- `src/lib/auth-jwt.ts` — intocado
