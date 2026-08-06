# C1 — Retrofit de RBAC T1-only nas rotas `/api/admin` preexistentes

**Papel:** implementador (fix do achado C1 — `f5-seguranca.md:45-52`)
**Data:** 2026-08-06
**Commit:** fix(security): enforce T1-only RBAC on pre-existing admin API routes

---

## Resumo

Todas as 23 rotas `/api/admin` preexistentes (que dependiam apenas do `src/middleware.ts`,
que valida assinatura/expiração do JWT mas **não** a role) agora exigem `T1_GERENCIA` via
`requireT1Admin()`. A única exceção é `auth/logout`, que continua acessível para
T1 **e** T2 via `requireApiAdmin()` (T2 precisa deslogar).

- **Helper novo:** `requireT1Admin()` em `src/lib/auth.ts:42-49` — envolve `requireApiAdmin()`
  e retorna `403 {"message":"Acesso negado"}` quando `auth.role !== "T1_GERENCIA"`.
- **Sem mudanças** de lógica de negócio, schemas, shapes de resposta ou `middleware.ts`.
- **Intactas:** `auth/login/route.ts` (pública) e as rotas já protegidas `users/*`, `arts/*`,
  `art-tags/*` (continuam com `requireApiAdmin` + `canAccessRoute`).

## Arquivos modificados e linha da checagem inserida

### `src/lib/auth.ts`
| Linha | Mudança |
|---|---|
| 42-49 | `requireT1Admin()` — 401 se não autenticado (via `requireApiAdmin`), 403 se não for `T1_GERENCIA` |

### Rotas com `requireT1Admin()` (checagem `const auth = await requireT1Admin(); if (auth instanceof NextResponse) return auth;` no topo de cada handler, antes do `try`)

| Rota | Linha(s) da checagem | Handlers |
|---|---|---|
| `leads/route.ts` | 7 | GET |
| `leads/[id]/route.ts` | 20 | PATCH |
| `chat-analytics/route.ts` | 6 | GET |
| `products/route.ts` | 28, 49 | GET, POST |
| `products/[id]/route.ts` | 31, 82 | PATCH, DELETE |
| `products/images/[imageId]/route.ts` | 15 | DELETE |
| `categories/route.ts` | 24, 43 | GET, POST |
| `categories/[id]/route.ts` | 28 | PATCH |
| `categories/size-table/route.ts` | 14 | POST |
| `faqs/route.ts` | 20, 40 | GET, POST |
| `faqs/[id]/route.ts` | 24, 68 | PATCH, DELETE |
| `testimonials/route.ts` | 24, 40 | GET, POST |
| `testimonials/[id]/route.ts` | 29, 73 | PATCH, DELETE |
| `instagram/route.ts` | 19, 34 | GET, POST |
| `instagram/[id]/route.ts` | 24, 64 | PATCH, DELETE |
| `modalities/route.ts` | 14, 30 | GET, POST |
| `modalities/[id]/route.ts` | 15 | PATCH |
| `size-charts/route.ts` | 19, 34 | GET, POST |
| `size-charts/[type]/route.ts` | 25, 47, 106 | GET, PATCH, DELETE |
| `site-setting/route.ts` | 17 | PATCH |
| `upload/route.ts` | 15 | POST |

### Rota com `requireApiAdmin()` (T1 **e** T2)

| Rota | Linha da checagem | Handler | Nota |
|---|---|---|---|
| `auth/logout/route.ts` | 5 | POST | T2_VENDEDOR precisa deslogar — `requireApiAdmin` valida apenas autenticação; lógica de limpeza do cookie intacta |

## Verificação

| Gate | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ exit 0, zero erros |
| `npm run test:unit` | ✅ 10 arquivos, **75/75 testes** passando (inclui `rbac.test.ts`) |

## Nota de segurança

- **Leads (PII/LGPD):** `GET /api/admin/leads` (nome, telefone, WhatsApp, mensagem) e
  `PATCH /api/admin/leads/[id]` agora exigem `T1_GERENCIA` → **T2_VENDEDOR recebe 403**.
  O gate do route group `(t1)` na UI já não é o único controle — a API agora rejeita no servidor.
- **Chat (PII):** `GET /api/admin/chat-analytics` (mensagens de chat e sessões recentes)
  agora é T1-only → T2 recebe 403.
- **Mutações T1:** products, categories, faqs, testimonials, instagram, modalities,
  size-charts, site-setting e uploads (produtos/categorias) — todos os métodos
  (GET/POST/PATCH/DELETE) negam T2 com 403.
- **Logout:** continua funcionando para ambas as roles (requisito funcional T2);
  requisições não autenticadas agora recebem 401 em vez de limpar cookie — sem regressão
  funcional (clientes do painel só chamam logout com sessão ativa).
- **Sem regressão T1:** `requireT1Admin` delega a `requireApiAdmin`, que revalida
  `isActive` no banco a cada requisição — T1 continua com acesso total.
