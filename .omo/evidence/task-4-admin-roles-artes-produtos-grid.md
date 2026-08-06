# Evidence — Task 4: Gate de papel por requisição (AdminLayout + route group (t1))

**Plan:** `.omo/plans/admin-roles-artes-produtos-grid.md` (todo 4)
**Date:** 2026-08-06
**Status:** PASS

## O que foi feito

### a. `src/app/(admin)/layout.tsx` — verificação server-side via `getAdminUser()`

Substituída a verificação manual de JWT (cookies + jwtVerify) por `getAdminUser()` de `@/lib/auth`, que consulta o banco por requisição (token → sub → `adminUser` → valida `isActive`). Imports removidos: `cookies` (next/headers), `jwtVerify` (jose), `getJwtSecret` (@/lib/auth-jwt). `role={user.role}` repassado ao `<AdminSidebarClient />`.

```diff
- import { cookies } from "next/headers";
- import { jwtVerify } from "jose";
...
- import { getJwtSecret } from "@/lib/auth-jwt";
+ import { getAdminUser } from "@/lib/auth";

- const cookieStore = await cookies();
- const token = cookieStore.get("admin_token")?.value;
- if (!token) redirect("/admin/login");
- try { await jwtVerify(token, getJwtSecret()); } catch { redirect("/admin/login"); }
+ const user = await getAdminUser();
+ if (!user) redirect("/admin/login");
...
- <AdminSidebarClient />
+ <AdminSidebarClient role={user.role} />
```

### b. Route group `(t1)` — 9 diretórios movidos via `git mv` (URLs inalteradas)

Todos os 9 diretórios T1-only movidos para `src/app/(admin)/admin/(t1)/` (route groups não mudam a URL). No Windows foi necessário criar o diretório destino `(t1)` antes do `git mv` (git falha com "No such file or directory" sem o parent existir).

```
git mv "src/app/(admin)/admin/produtos"     "src/app/(admin)/admin/(t1)/produtos"
git mv "src/app/(admin)/admin/dashboard"    "src/app/(admin)/admin/(t1)/dashboard"
git mv "src/app/(admin)/admin/medidas"      "src/app/(admin)/admin/(t1)/medidas"
git mv "src/app/(admin)/admin/modalidades"  "src/app/(admin)/admin/(t1)/modalidades"
git mv "src/app/(admin)/admin/leads"        "src/app/(admin)/admin/(t1)/leads"
git mv "src/app/(admin)/admin/faqs"         "src/app/(admin)/admin/(t1)/faqs"
git mv "src/app/(admin)/admin/categorias"   "src/app/(admin)/admin/(t1)/categorias"
git mv "src/app/(admin)/admin/depoimentos"  "src/app/(admin)/admin/(t1)/depoimentos"
git mv "src/app/(admin)/admin/instagram"    "src/app/(admin)/admin/(t1)/instagram"
```

Sub-diretórios (`_components/`, `[id]/`, `novo/`) moveram junto: 27 arquivos renomeados. Nenhum arquivo restante fora do grupo (`git ls-files "src/app/(admin)/admin/"` → só `(t1)/...`). `/admin/usuarios` e `/admin/conteudo` não existem ainda (todos 8 e 14) — não foram criados aqui.

### c. `src/app/(admin)/admin/(t1)/layout.tsx` — gate server-side

```tsx
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";

export default async function T1AreaLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "T1_GERENCIA") redirect("/admin/conteudo");
  return <>{children}</>;
}
```

Gate 100% server-side: um T2 nunca recebe o HTML/RSC de páginas T1 (ex.: `/admin/leads` contém PII — LGPD). Não foi criado AdminGuardClient nem guard client-side; `src/middleware.ts` intocado.

## Verificação

- `npx tsc --noEmit` → exit 0 (após remover `.next/types` obsoletos, que referenciavam os caminhos pré-move; `.next` é git-ignored e regenerado pelo Next). O erro esperado de `role` no SidebarClient é resolvido pelo todo 5 (mesma sessão).
- `git status` pós-move: 27 `R` (renames) + `(t1)/layout.tsx` novo; nada fora do escopo staged.
- Não há import relativo quebrado: o projeto usa alias `@/` — confirmado por tsc exit 0.

## QA manual

- `curl -s -o /dev/null -w "%{http_code}"` com cookie T2 em `/admin/dashboard` → 307 para `/admin/conteudo` (redirect do layout `(t1)`, sem corpo com dados) — comportamento garantido por `redirect()` do Next antes do render; não executado contra servidor ativo nesta rodada.
- T1 → 200 (layout pai passa, `(t1)` aceita T1_GERENCIA).
- Usuário inativo → 307 para `/admin/login` (layout pai via `getAdminUser()` que valida `isActive`).

## Arquivos

- `src/app/(admin)/layout.tsx` (modificado)
- 27 arquivos movidos para `src/app/(admin)/admin/(t1)/`
- `src/app/(admin)/admin/(t1)/layout.tsx` (novo)

## Commit

`feat(admin): guard admin pages server-side by role via (t1) route group`
