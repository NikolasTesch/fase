# Correção de Gaps Críticos no Backend

> **Status:** `pendente`
> **ID:** `2026-06-12-backend-gap-fixes`
> **Criada em:** 2026-06-12
> **Agente:** arquiteto

---

## Contexto

Auditoria do backend identificou 10 gaps entre a spec técnica e a implementação atual. Os itens críticos bloqueiam o setup de produção (migrations/seed do Prisma falham) e comprometem fluxos centrais do produto (WhatsApp, upload de imagens, `/api/contact`). Os demais degradam silenciosamente a experiência ou induzem erros 500 onde deveriam ser 404.

**Impacto de não corrigir:**
- Impossível rodar `npx prisma migrate dev` ou `npx prisma db seed` → deploy bloqueado
- Seed falha em produção (Neon Serverless) por instanciar Prisma sem o adapter correto
- Botão WhatsApp silenciosamente quebrado se env var ausente
- Endpoint `/api/contact` cai inteiro se Redis não estiver configurado
- 2 categorias (Colete, Acessórios) invisíveis na navbar

---

## Objetivos

- [ ] Corrigir `prisma/schema.prisma` — adicionar `url = env("DATABASE_URL")` ao datasource
- [ ] Corrigir `prisma/seed.ts` — usar o adapter `PrismaPg` compatível com Neon
- [ ] Corrigir `src/lib/site.ts` — adicionar Colete e Acessórios ao `CATEGORY_NAV`
- [ ] Corrigir `src/app/api/products/route.ts` — validar `limit` antes de `parseInt`
- [ ] Corrigir `src/app/api/admin/products/[id]/route.ts` — retornar 404 para P2025
- [ ] Corrigir `src/lib/site.ts` — guardar WhatsApp URL com fallback explícito ou aviso
- [ ] Atualizar `spec.md` — alinhar path do upload e status do POST `/api/admin/leads`

## Fora de escopo

- Implementar POST `/api/admin/leads` (ausência é intencional — leads chegam via `/api/contact`)
- Alterar lógica de negócio dos endpoints (só correções defensivas)
- Migrar o sistema de e-mail (Resend) ou mudar o template de notificação
- Qualquer nova feature ou page

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `prisma/schema.prisma` | modificar | Adicionar `url = env("DATABASE_URL")` no datasource |
| `prisma/seed.ts` | modificar | Instanciar Prisma com `PrismaPg` + `pg.Pool` igual ao `lib/db.ts` |
| `src/lib/site.ts` | modificar | Adicionar Colete e Acessórios ao `CATEGORY_NAV`; aviso em dev se `NEXT_PUBLIC_WHATSAPP_NUMBER` vazio |
| `src/app/api/products/route.ts` | modificar | Validar `parseInt(limit)` — rejeitar NaN |
| `src/app/api/admin/products/[id]/route.ts` | modificar | Tratar `PrismaClientKnownRequestError` P2025 como 404 |
| `spec.md` | modificar | §18.1: corrigir path upload; §12.2: anotar POST leads como não implementado |

### Decisões técnicas (ADR)

**ADR-1: `prisma/schema.prisma` — `url` no datasource com adapter**

Com `@prisma/adapter-pg`, o runtime usa o pool manual (não o URL do schema). Porém, o Prisma CLI continua precisando do `url` para `migrate`, `db push` e `generate`. A solução padrão para Neon é manter ambos:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
O adapter no `db.ts` sobrescreve a conexão em runtime — o campo do schema é só para o CLI.

**ADR-2: `prisma/seed.ts` — adapter no seed**

O seed roda via `tsx prisma/seed.ts` (Node.js puro), fora do Next.js. Para manter consistência com o `lib/db.ts` e evitar falha no Neon em produção, o seed deve criar o pool manualmente e usar `PrismaPg`:
```ts
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
```
Isso garante que o seed funcione tanto com Neon (pooler) quanto com Postgres local (Docker).

**ADR-3: validação de `limit` em `/api/products`**

Usar `Number.isNaN` após `parseInt` em vez de Zod (overhead desnecessário para um query param simples). Rejeitar silenciosamente (ignorar o param) em vez de retornar 400, pois é endpoint público.

**ADR-4: tratamento P2025 em admin products**

Importar `Prisma` do `@prisma/client` e checar `error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'` para retornar 404. Manter o catch genérico para outros erros.

**ADR-5: WhatsApp URL sem env var**

Em desenvolvimento, logar `console.warn` se `NEXT_PUBLIC_WHATSAPP_NUMBER` for vazio. Em produção, a verificação é responsabilidade da configuração de deploy (Vercel env vars). Não lançar exceção — degradação graciosa é preferível a crash.

---

## Checklist de Implementação

> Executar nesta ordem — itens 1 e 2 são pré-requisito para testar os demais localmente.

- [ ] 1. **`prisma/schema.prisma`** — adicionar `url = env("DATABASE_URL")` ao bloco `datasource db`
- [ ] 2. **`prisma/seed.ts`** — substituir `new PrismaClient()` por instância com `PrismaPg` adapter (ver ADR-2)
- [ ] 3. **`src/lib/site.ts`** — adicionar `{ slug: "colete", label: "Colete" }` e `{ slug: "acessorios", label: "Acessórios" }` ao `CATEGORY_NAV`
- [ ] 4. **`src/lib/site.ts`** — adicionar `console.warn` em dev quando `NEXT_PUBLIC_WHATSAPP_NUMBER` for falsy em `buildWhatsAppUrl`
- [ ] 5. **`src/app/api/products/route.ts`** — validar `parseInt(limit, 10)` e ignorar se `NaN`
- [ ] 6. **`src/app/api/admin/products/[id]/route.ts`** — importar `Prisma` de `@prisma/client`; tratar P2025 com 404 em `PATCH` e `DELETE`
- [ ] 7. **`spec.md §18.1`** — corrigir linha `POST /api/upload` para `POST /api/admin/upload`
- [ ] 8. **`spec.md §12.2`** — adicionar nota em `GET/POST /api/admin/leads` que o POST não foi implementado (leads chegam via `/api/contact`)

## Critérios de Aceitação

- [ ] `npx prisma validate` roda sem erro
- [ ] `npx prisma migrate dev` (ou `db push`) conecta ao banco sem falhar
- [ ] `npx prisma db seed` completa sem erro em ambiente local
- [ ] A navbar exibe 8 categorias (futebol, volei, basquete, handebol, passeio, agasalho, **colete**, **acessorios**)
- [ ] `GET /api/products?limit=abc` retorna 200 com lista completa (ignora param inválido), não 500
- [ ] `PATCH /api/admin/products/id-inexistente` retorna 404, não 500
- [ ] `DELETE /api/admin/products/id-inexistente` retorna 404, não 500
- [ ] `tsc --noEmit` passa sem erros após as mudanças

---

## Notas

- **Ordem de execução importa:** sem o fix do schema (item 1), o `prisma generate` pode falhar e impedir a compilação TypeScript.
- **Sem migration necessária:** nenhuma mudança altera o schema de dados — apenas o datasource. Não é preciso criar migration.
- **Env vars obrigatórias para testes:** `DATABASE_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NEXT_PUBLIC_WHATSAPP_NUMBER`. Sem elas, o rate limit e o WhatsApp seguem com comportamento degradado (documentado nos gaps 6 e 8 — fora do escopo desta spec por serem questões de infraestrutura).
- **Gap 10 (spec inconsistente sobre POST leads):** confirmado intencional — leads vêm exclusivamente de `/api/contact`. A spec apenas precisava de anotação.
