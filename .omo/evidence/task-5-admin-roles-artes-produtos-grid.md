# Evidence — Task 5: Sidebar filtrada por papel + itens Conteúdo e Usuários

**Plan:** `.omo/plans/admin-roles-artes-produtos-grid.md` (todo 5)
**Date:** 2026-08-06
**Status:** PASS

## O que foi feito

`src/app/(admin)/_components/AdminSidebarClient.tsx`:

### a. Prop `role`

```tsx
type AdminRole = "T1_GERENCIA" | "T2_VENDEDOR";

export function AdminSidebarClient({ role }: { role: AdminRole }) {
```

Tipagem exata — passar role inválido falha o type-check (QA "failure" do plano).

### b. NAV estendido (2 itens novos)

```tsx
import { ..., Images, UserCog } from "lucide-react";

const NAV = [
  ...
  { href: "/admin/conteudo", label: "Conteúdo", icon: Images },
  { href: "/admin/usuarios", label: "Usuários", icon: UserCog },
];
```

### c. Filtro por papel

```tsx
const items =
  role === "T2_VENDEDOR"
    ? NAV.filter((item) => item.href === "/admin/conteudo")
    : NAV;
```

- T2 → APENAS o item Conteúdo.
- T1 → NAV completo (11 itens, incluindo Conteúdo e Usuários).

### d. Preservado

Todas as animações framer-motion (stagger `initial/animate`, spring do indicador), `layoutId="admin-nav-active"`, estrutura do `<ul>`/`<motion.li>` e os hrefs existentes inalterados.

## Verificação

- `npx tsc --noEmit` → exit 0 (com o novo prop `role` recebido de `layout.tsx`).
- Nenhum outro item do NAV alterado; nenhum href existente modificado.

## QA manual

- Logar como T2 → sidebar renderiza 1 item (Conteúdo). Redirecionamento de login por papel cobre o caminho (todo 6 já aplicado).
- Logar como T1 → sidebar renderiza 11 itens.
- Passar role inválido → TS error (prop tipada com union).

## Arquivos

- `src/app/(admin)/_components/AdminSidebarClient.tsx` (modificado)

## Commit

`feat(admin): filter sidebar by role and add Conteúdo/Usuários links`
