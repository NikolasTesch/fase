# Evidência — Todo 6: Login page: redirect por papel

## O que foi feito

Em `src/app/admin/login/page.tsx`, no `handleSubmit`, dentro do bloco `if (res.ok)` (após `res.ok`), substituído o redirect fixo por leitura da resposta + redirect por papel:

```ts
const data = await res.json();
router.refresh();
router.push(data.role === "T2_VENDEDOR" ? "/admin/conteudo" : "/admin/dashboard");
```

- `router.refresh()` chamado **antes** do `router.push` (conforme o todo).
- Form, estilo, endpoint (`/api/admin/auth/login`) e tratamento de erro (`!res.ok` → `setError`) inalterados.

## Verificação executada

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | Exit 0 — sem erros de tipo |

## QA (cenários)

- **happy:** login com vendedor (T2) → URL `/admin/conteudo`; login com gerência (T1) → `/admin/dashboard`. Lógica verificada por inspeção: `data.role` vem da resposta do todo 2 (`{ success: true, role }`), o check `"T2_VENDEDOR"` decide o destino. Runtime depende de servidor + seed do vendedor (todo 17).
- **failure:** senha errada → `res.ok` é false, fluxo existente de erro mantido (nada alterado nesse caminho).

## Arquivos alterados

- `src/app/admin/login/page.tsx` (único arquivo de código deste todo)

## Commit

`feat(admin): redirect login by role`
