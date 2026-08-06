# Auditoria de Segurança — Admin Roles / Artes / Produtos Grid

**Papel:** seguranca (AGENTS.md)
**Escopo:** commits 0cfdc86, 5146dc4, b258374, 5f70a7b, e819141, bb035bd, e6894a5, ee9fc62, bd39ae6, 75829d2, a76337e, de54bb0, 1d4d840, f48bd52, 47228da, 06a0743
**Modo:** somente leitura — nenhum arquivo de código foi modificado
**Data:** 2026-08-06

---

## Veredito: **REPROVADO**

Foram encontrados **2 achados CRÍTICOS** exploráveis no ambiente de produção:

1. **C1 — Bypass de RBAC (T2 → T1) em todas as rotas `/api/admin` preexistentes**, com exposição de PII de leads (LGPD). O gate da página `/admin/leads` (route group `(t1)`) protege apenas a UI; a API subjacente não tem checagem de role.
2. **C2 — `JWT_SECRET_FALLBACK` hardcoded** no código-fonte, tornando a aplicação vulnerável a forja total de sessão admin quando `JWT_SECRET` não está configurado (fail-open de configuração).

---

## Checklist positivo (verificado, sem achados)

| Item | Resultado |
|---|---|
| **Inatividade de usuário** — `getAdminUser` revalida `isActive` no banco a cada requisição (`src/lib/auth.ts:22-23`); login rejeita inativo (`login/route.ts:41-43`); token inválido imediatamente após desativação | ✅ Correto |
| **Claims JWT não confiáveis** — role/email/isActive no token são informativos; autorização sempre revalidada no servidor (`auth.ts:22-25`) | ✅ Correto |
| **Middleware edge sem DB** — `src/middleware.ts` só faz `jwtVerify` (jose, edge-safe); nenhum acesso a Prisma no edge | ✅ Correto |
| **Cookie de sessão** — `HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800` (`login/route.ts:52-55`) | ✅ Correto |
| **bcrypt cost 12** em criação e alteração de senha (`users/route.ts:63`, `users/[id]/route.ts:47`) | ✅ Correto |
| **Self-deactivation guard** — `users/[id]/route.ts:39-41` | ✅ Correto |
| **CSRF + rate limit** em: users POST, arts upload, arts PATCH, art-tags POST/PATCH/DELETE | ✅ Presente |
| **Ownership T2** em PATCH/DELETE de artes (`arts/[id]/route.ts:31-33, 92-94`) | ✅ Presente (faltou em preview/download — ver I1) |
| **Drive**: scope `drive.file` (mínimo), sem links públicos, service account nunca no bundle client (imports de `@/lib/drive` apenas em rotas server) | ✅ Correto |
| **Upload preview**: allowlist de MIME + limite 10MB + validação real de conteúdo via `sharp().metadata()` (`upload/route.ts:73-88`) | ✅ Correto |
| **Path traversal**: nome do arquivo original nunca toca filesystem (vai direto para o nome do arquivo no Drive); sem escrita local | ✅ Não aplicável |
| **SQL injection**: todas as consultas via Prisma parametrizado (`contains`/`insensitive` em `arts/route.ts:22`); sem string SQL | ✅ Não aplicável |
| **Zod v4**: schemas adequados para os campos novos (`validations/arts.ts`, `validations/auth.ts`) | ✅ Adequado |
| **Seed**: credenciais admin/vendedor vindas de env vars, sem senha hardcoded (`seed.ts:13-41`) | ✅ Correto |
| **Erros Drive**: mensagens de erro são strings fixas ("GOOGLE_..."), não vazam credenciais (`upload/route.ts:138-144`) | ✅ Correto |
| **Header injection em download**: `filename*` passa por `encodeURIComponent` (`download/route.ts:31`) | ✅ Correto |
| **Cleanup**: upload falho remove arquivos do Drive best-effort (`upload/route.ts:127-134`) | ✅ Correto |

---

## Achados CRÍTICOS

### C1 — Bypass de role em TODAS as rotas `/api/admin` preexistentes → T2 acessa dados e mutações de T1 via API

- **Arquivo/linha:** `src/app/api/admin/leads/route.ts:5-29` (GET sem qualquer autenticação/role — depende só do middleware); `leads/[id]/route.ts:18-43`; `chat-analytics/route.ts:4-55`; `products/route.ts`, `products/[id]/route.ts`, `faqs/*`, `testimonials/*`, `categories/*`, `size-charts/*`, `instagram/*`, `modalities/*`, `site-setting/route.ts`, `upload/route.ts` — **nenhuma** chama `requireApiAdmin`/`canAccessRoute` (confirmado por grep em todas as 28 rotas `/api/admin`).
- **Explicação:** O RBAC novo (commits cb026c2/5f70a7b) protegeu apenas as rotas novas (users, arts, art-tags). As rotas preexistentes contam exclusivamente com `src/middleware.ts:5-35`, que só valida assinatura/expiração do JWT — **sem checar role** (correto para edge, mas insuficiente). Como o login emite token para qualquer admin ativo, incluindo `T2_VENDEDOR` (`login/route.ts:45`; seed cria vendedor T2 em produção, `seed.ts:28-41`), um vendedor autenticado pode chamar diretamente:
  - `GET /api/admin/leads` → **nome, telefone, WhatsApp e mensagem de todos os leads** — exposição de PII (LGPD). O gate da página via route group `(t1)` (`(t1)/layout.tsx:7`) protege só o front; a API não foi retrofittada.
  - `POST/PATCH/DELETE /api/admin/products`, `faqs`, `testimonials`, `categories`, `size-charts`, `site-setting`, `instagram`, `modalities`, `upload` → mutações de conteúdo T1 (preços, contatos, catálogo) sem restrição de role.
  - `GET /api/admin/chat-analytics` → mensagens de chat (PII).
- **Correção sugerida:** adicionar `requireApiAdmin()` + `canAccessRoute(auth.role, req.nextUrl.pathname, method)` em **todas** as rotas `/api/admin` preexistentes (leads em primeiro lugar — T2 deve ser negado), ou criar um wrapper compartilhado (`withAdminRole(handler, allowedRoles)`) e aplicá-lo em todas.

### C2 — `JWT_SECRET_FALLBACK` hardcoded no código-fonte (forja de token admin)

- **Arquivo/linha:** `src/lib/auth-jwt.ts:1` (`JWT_SECRET_FALLBACK = "fasesport_jwt_secret_default_2026"`) e `:4` (`process.env.JWT_SECRET || JWT_SECRET_FALLBACK`).
- **Explicação:** Se `JWT_SECRET` não estiver setado no ambiente de produção (erro de config, preview env, fork do template), a aplicação usa silenciosamente um segredo **público, commitado no repositório**. Qualquer pessoa que conheça o código pode forjar um JWT HS256 com `sub` = id de um `AdminUser` e obter acesso total ao painel (middleware + todas as rotas aceitam). Não há warning nem erro no boot quando o fallback é usado. Fail-open de configuração para o controle mais crítico do sistema.
- **Correção sugerida:** remover o fallback; `getJwtSecret()` deve lançar erro se `JWT_SECRET` ausente (fail-closed); validar no boot que o secret tem ≥ 32 chars e rotacionar o valor atual.

---

## Achados IMPORTANTES

### I1 — Ownership T2 não verificado em preview/download de artes

- **Arquivo/linha:** `src/app/api/admin/arts/[id]/preview/route.ts:20-33` e `src/app/api/admin/arts/[id]/download/route.ts:20-33`.
- **Explicação:** `canAccessRoute` libera T2 para `preview|download` (`auth.ts:55`) e o comentário de `auth.ts:53` afirma que "ownership é checado na rota" — porém só `PATCH`/`DELETE` checam (`arts/[id]/route.ts:31-33, 92-94`). Qualquer vendedor T2 pode baixar o **arquivo original** (logotipos/escudos/artes de clientes de outros vendedores) apenas iterando IDs. Exposição de ativo comercial dos clientes.
- **Correção sugerida:** nas rotas de preview/download, para T2, exigir `art.createdById === auth.id` (T1 continua vendo tudo).

### I2 — Drive fileIds vazam em respostas da API (meta do plano: "fileId nunca vaza")

- **Arquivo/linha:** `src/app/api/admin/arts/route.ts:32` (`Response.json(arts)` com record completo) e `arts/[id]/route.ts:63` (`Response.json(updated)`). O modelo expõe `previewFileId`/`originalFileId` (`prisma/schema.prisma:190,192`).
- **Explicação:** `GET /api/admin/arts` retorna todos os campos escalares, incluindo os IDs dos arquivos no Drive. Sozinhos eles não concedem acesso (pasta privada, scope `drive.file`), mas violam a meta declarada do plano, expõem estrutura interna e reduzem o trabalho de um atacante caso a credencial da service account vaze.
- **Correção sugerida:** usar `select` explícito (sem os campos `*FileId`) ou mapear para DTO antes de responder; no PATCH, idem.

### I3 — Original de arte sem validação de magic bytes; MIME do download é controlado pelo cliente

- **Arquivo/linha:** `src/app/api/admin/arts/upload/route.ts:90-96` (original validado só por extensão + 20MB) e `:107,119` (`original.type` do cliente armazenado como MIME); `download/route.ts:30` (`Content-Type: art.originalMimeType`).
- **Explicação:** Um T2 pode enviar conteúdo arbitrário (ex.: HTML/JS disfarçado de `.svg`, `.pdf` ou `.cdr`) e o download o serve com `Content-Type` fornecido pelo próprio cliente. O `Content-Disposition: attachment` (`download/route.ts:31`) impede execução inline no navegador, mitigando XSS armazenado, mas o conteúdo armazenado é não-confiável e pode ser arma em máquinas de admins (SVG/EPS com scripts, PDFs maliciosos).
- **Correção sugerida:** sniffing de magic bytes para os originais (ou ao menos forçar `application/octet-stream` para não-imagens em vez de confiar no cliente); banir `svg`/`html`-adjacentes ou sanitizar; adicionar `X-Content-Type-Options: nosniff` em preview e download.

### I4 — Rate limit fail-open (sem Redis configurado ou em erro, proteção desativada silenciosamente)

- **Arquivo/linha:** `src/lib/ratelimit.ts:14-24` (sem env → `limit()` sempre `success: true`); `login/route.ts:22-24` (exceção do Redis capturada e ignorada).
- **Explicação:** Em qualquer ambiente sem `UPSTASH_REDIS_REST_URL/TOKEN` (ou com Redis fora do ar), brute force de login e abuso de upload/admin CRUD ficam sem limite. Combinado com C2, o padrão "funciona mesmo sem configurar segurança" é sistêmico.
- **Correção sugerida:** fail-closed para login (rejeitar/erro 503 se o limiter não estiver disponível) e logging explícito para os demais; alerta no boot quando Redis ausente.

### I5 — `getClientIp` confia em headers controláveis (spoofing de X-Forwarded-For)

- **Arquivo/linha:** `src/lib/ip.ts:13-25`.
- **Explicação:** Prioriza `x-real-ip` (seguro na Vercel, que o sobrescreve), mas o fallback usa o **primeiro** valor de `x-forwarded-for`, que o cliente pode forjar onde o proxy não o sobrescreve (self-host/nginx que apenas anexa, preview envs) → bypass dos rate limits (login:10/15min, upload:10/min, admin:60/min) com XFF rotativo.
- **Correção sugerida:** usar `req.ip` da plataforma quando disponível; na Vercel usar `x-vercel-forwarded-for`/`req.ip`; fora dela, confiar apenas em proxy confiável conhecido.

---

## Achados MENORES

### M1 — DELETE de arte sem CSRF e sem rate limit

- **Arquivo/linha:** `src/app/api/admin/arts/[id]/route.ts:76-115` (DELETE sem `validateCsrf` nem `adminRatelimit`; PATCH e art-tags DELETE têm).
- **Explicação:** Inconsistência com o restante. CSRF mitigado pelo cookie `SameSite=Strict`; ausência de rate limit permite deleção em massa com sessão comprometida.
- **Correção:** adicionar `validateCsrf` + `adminRatelimit` no DELETE.

### M2 — PATCH de usuário sem CSRF e sem rate limit

- **Arquivo/linha:** `src/app/api/admin/users/[id]/route.ts:20-63` (sem `validateCsrf`/`adminRatelimit`; POST em `users/route.ts:51-56` tem). Mesma mitigação SameSite=Strict.
- **Correção:** adicionar os dois, como no POST.

### M3 — Respostas de streaming sem `X-Content-Type-Options: nosniff`

- **Arquivo/linha:** `preview/route.ts:28-33`, `download/route.ts:28-33`.
- **Correção:** adicionar o header em ambas.

### M4 — Login CSRF (sem checagem de Origin/Referer no endpoint público)

- **Arquivo/linha:** `login/route.ts:10-57`.
- **Explicação:** `SameSite=Strict` impede o *envio* cross-site do cookie, mas não impede o *set* na resposta — um site malicioso pode logar a vítima na conta do atacante. Impacto baixo (a sessão é do atacante).
- **Correção:** reusar `validateCsrf(req)` no login (ou exigir token de challenge).

### M5 — GET /api/admin/art-tags sem `canAccessRoute`

- **Arquivo/linha:** `art-tags/route.ts:22-37` (só `requireApiAdmin`).
- **Explicação:** T2 tem permissão de GET pelo `canAccessRoute`, então sem impacto funcional hoje; quebra o padrão "toda rota valida role" e fragiliza o modelo.
- **Correção:** chamar `canAccessRoute` no GET também.

### M6 — Logout sem CSRF

- **Arquivo/linha:** `auth/logout/route.ts:3-12`.
- **Explicação:** POST sem `validateCsrf`. Impacto: apenas logout forçado; cookie SameSite=Strict impede envio cross-site.
- **Correção:** opcional, adicionar check por consistência.

### M7 — Sem rate limit em preview/download (streaming)

- **Arquivo/linha:** `preview/route.ts`, `download/route.ts`.
- **Explicação:** admin autenticado pode acionar streaming massivo → custo/limite de API do Google Drive e banda.
- **Correção:** limitar por IP/usuário (ex.: `adminRatelimit`).

---

## Achados INFORMATIVOS

### N1 — Timing de enumeração de usuário no login
- **Arquivo/linha:** `login/route.ts:37-39`. `bcrypt.compare` não roda quando o usuário não existe → diferença mensurável de tempo revela e-mails cadastrados. Correção: comparar contra hash dummy.

### N2 — Tokens não revogáveis
- Sem claim de versão/`jti`; troca de senha não invalida tokens existentes (válidos por 7d); logout é client-side apenas. Trade-off padrão de JWT stateless; aceitável, documentar.

### N3 — Política de senha fraca
- `validations/auth.ts:5,13,21` — mínimo 8 chars, sem complexidade nem máximo; bcrypt trunca em 72 bytes.

### N4 — `canAccessRoute` T1 usa prefix matching (`startsWith`)
- `auth.ts:44` — `/admin2` casaria; sem rotas correspondentes hoje, inofensivo. Preferir segment-aware match.

### N5 — Sem trilha de auditoria de ações admin
- Nenhum log de "quem fez o quê" (criação de usuário, deleção de arte, mudança de role). Relevante para LGPD e resposta a incidentes.

### N6 — `validateCsrf` libera requisições sem Origin/Referer em ambiente Vercel
- `csrf.ts:74-76` — falha aberta para clientes não-browser; aceitável com SameSite=Strict + Host validado pela plataforma, mas reduz o valor do controle para chamadas server-to-server.

### N7 — Campos não auditados de rotas preexistentes
- `products`, `faqs`, `testimonials`, `categories`, `instagram`, `modalities`, `size-charts`, `site-setting` retornam records completos (possível excesso de dados); fora do escopo dos commits, citado por completude.

---

## Resumo executivo

| Severidade | Qtd | Descrição curta |
|---|---|---|
| CRÍTICO | 2 | C1: T2 acessa leads/PII e mutações T1 via API (rotas preexistentes sem role check); C2: JWT fallback hardcoded (forja de sessão se env ausente) |
| IMPORTANTE | 5 | Ownership ausente em preview/download; fileIds vazados; original sem magic bytes; rate limit fail-open; IP spoofable |
| MENOR | 7 | CSRF/RL ausentes em DELETE arts e PATCH users; falta nosniff; login CSRF; inconsistências |
| INFORMATIVO | 7 | Timing login, tokens não revogáveis, política de senha, etc. |

**Recomendação:** antes do merge/PR, corrigir C1 (retrofit de `canAccessRoute` em todas as rotas `/api/admin`, priorizando leads) e C2 (remover fallback do JWT). Corrigir I1–I5 na mesma rodada. Os pontos fortes da implementação — revalidação de `isActive` por requisição, checks de ownership no PATCH/DELETE de artes, CSRF+rate limit nas rotas novas, validação real do preview via sharp, service account isolada do bundle client — devem ser preservados.

---

## Re-auditoria pós-correção (2026-08-06)

**Escopo:** commits `11e731a` (C2, I1, I2, I3, I4, I5) e `d2fb8d1` (C1 — `requireT1Admin` + retrofit de 23 rotas), confirmados no HEAD (`git log`).
**Modo:** somente leitura — nenhum arquivo de código foi modificado.
**Gates:** `npx tsc --noEmit` → **exit 0**; `npm run test:unit` → **75/75 passaram**.

| Achado | Status | Evidência (arquivo:linha) |
|---|---|---|
| **C1** — RBAC T1-only nas rotas `/api/admin` preexistentes | ✅ **RESOLVIDO** | `requireT1Admin()` existe em `src/lib/auth.ts:42-49` e retorna 403 para `role !== "T1_GERENCIA"` (`:45-47`). Retrofit verificado nas 23 rotas — todas com `if (auth instanceof NextResponse) return auth;` logo após o check: `leads/route.ts:7-8`, `leads/[id]/route.ts:20-21`, `chat-analytics/route.ts:6-7`, `products/route.ts:28-29,49-50`, `products/[id]/route.ts:31,82`, `products/images/[imageId]/route.ts:15`, `categories/route.ts:24,43`, `categories/[id]/route.ts:28`, `categories/size-table/route.ts:14`, `faqs/route.ts:20,40`, `faqs/[id]/route.ts:24,68`, `testimonials/route.ts:24,40`, `testimonials/[id]/route.ts:29,73`, `instagram/route.ts:19,34`, `instagram/[id]/route.ts:24,64`, `modalities/route.ts:14,30`, `modalities/[id]/route.ts:15`, `size-charts/route.ts:19,34`, `size-charts/[type]/route.ts:25,47,106`, `site-setting/route.ts:17-18`, `upload/route.ts:15-16`. Grep em **todas as 32 rotas** `/api/admin`: 44 chamadas de auth (34×`requireT1Admin` + 10×`requireApiAdmin`), 48 guards `instanceof NextResponse` — nenhuma rota ficou sem checagem. Rotas users/arts/art-tags intactas com `requireApiAdmin`+`canAccessRoute` (`users/route.ts:25,27,45,47`, `users/[id]/route.ts:27,29`, `arts/route.ts:10,13`, `arts/[id]/route.ts:22,25,83,86`, `arts/upload/route.ts:35,39`, `arts/[id]/preview/route.ts:17,20`, `arts/[id]/download/route.ts:17,20`, `art-tags/route.ts:24,41,44`, `art-tags/[id]/route.ts:29,32,83,86`). `auth/logout/route.ts:5-6` usa `requireApiAdmin` (permitido). `auth/login/route.ts` **continua pública** (sem check — correto). |
| **C2** — Fallback hardcoded do JWT | ✅ **RESOLVIDO** | `src/lib/auth-jwt.ts:1-7`: `getJwtSecret()` **lança** `Error("JWT_SECRET não configurada")` se `process.env.JWT_SECRET` ausente (`:3-5`); nenhuma constante de fallback. Grep `fasesport_jwt_secret`, `FALLBACK`, `JWT_SECRET_FALLBACK` em `src/` → **0 ocorrências**. Única referência a `JWT_SECRET` no código é `auth-jwt.ts:2`. |
| **I1** — Ownership T2 em preview/download | ✅ **RESOLVIDO** | `arts/[id]/preview/route.ts:26-28` e `arts/[id]/download/route.ts:26-28`: `if (auth.role === "T2_VENDEDOR" && art.createdById !== auth.id) return errorResponse(..., 403)` — antes do streaming (`:30`). |
| **I2** — fileIds vazados na API | ✅ **RESOLVIDO** | `arts/route.ts:25-38`: `select` explícito **sem** `previewFileId`/`originalFileId`. `arts/[id]/route.ts:63`: PATCH retorna DTO `{ id, name }`. Bônus: `arts/upload/route.ts:131` também retorna DTO. |
| **I3** — Original sem magic bytes / MIME do cliente | ✅ **RESOLVIDO** | `arts/upload/route.ts:103-107`: originais de extensão não-imagem forçados a `application/octet-stream` (`isImageExt && original.type ? original.type : "application/octet-stream"`). `X-Content-Type-Options: nosniff` em `preview/route.ts:35` e `download/route.ts:35`. Download mantém `Content-Disposition: attachment` (`download/route.ts:34`) → sem execução inline. Resíduo aceito: extensões de imagem ainda confiam no MIME do cliente (`upload/route.ts:107`), mitigado pelo attachment. |
| **I4** — Rate limit fail-open | ✅ **RESOLVIDO** | `src/lib/ratelimit.ts:14-21`: sem Redis (`hasRedisEnv` falso, `:4-8`) o limiter **lança** `Error("UPSTASH_REDIS_REST_URL/TOKEN não configurados")` em `limit()` — nunca `success:true`. `auth/login/route.ts:14-28`: try/catch interno em volta do limiter → **503** "Serviço temporariamente indisponível" (não engole o erro). |
| **I5** — IP spoofable via XFF | ✅ **RESOLVIDO** | `src/lib/ip.ts:13-28`: ordem `x-real-ip` (`:14-15`) → `x-vercel-forwarded-for` (`:17-18`) → **último** valor de `x-forwarded-for` (`ips[ips.length - 1]`, `:22-26`) com comentário documentando a cadeia de proxies. |

### Observações novas introduzidas pelas correções (não-bloqueantes)

1. **Endpoints públicos agora falham fechados em outage de Redis** — `api/contact/route.ts:20` e `api/chat/fabi/route.ts:51` chamam `ratelimit.limit()` sem try/catch próprio; com Redis ausente/fora do ar o throw cai no catch genérico → **500** para o visitante. Direção correta (fail-closed, coerente com I4) e o erro é logado, mas, diferente do login (503 com mensagem amigável), o formulário público retorna 500. Considerar try/catch → 503 também nesses dois.
2. **Rotas admin mutantes com Redis ausente** → `adminRatelimit`/`uploadRatelimit` lançam dentro do try da rota → 500 "Erro interno" (leads PATCH, products POST, site-setting PATCH, arts upload/PATCH, upload, art-tags POST/PATCH/DELETE, users POST). Fail-closed intencional; aceitável.
3. **Menores M1–M7 e informativos N1–N7 da auditoria original permanecem abertos** (fora do escopo dos dois commits de fix): M5 (GET `art-tags` sem `canAccessRoute`, `art-tags/route.ts:24` — sem impacto funcional pois `canAccessRoute` libera T2 no GET) e M3/M7 (rate limit em preview/download) seguem como estavam. Nenhuma rota **perdeu** checagem no processo.

---

## Veredito final (re-auditoria): **APROVADO**

Todos os achados críticos e importantes da auditoria original foram **resolvidos e verificados no código atual** (C1, C2, I1–I5). Nenhum achado crítico novo; as observações pós-fix são de comportamento/disponibilidade (fail-closed em endpoints públicos com Redis fora do ar) e menores pré-existentes, sem impacto de segurança bloqueante. Gates automatizados verdes: `tsc --noEmit` exit 0, `test:unit` 75/75.
