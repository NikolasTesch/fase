<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

**Confirmed breaking change (Next.js 16):** `params` and `searchParams` in page/route components are `Promise<...>` — always `await params` before destructuring.
<!-- END:nextjs-agent-rules -->

---

# Workflow de Agentes — Fase Sport

Todo trabalho não-trivial neste repositório segue o pipeline abaixo. Cada agente tem uma função única e não deve substituir o outro.

## Pipeline padrão

```
arquiteto → implementador → revisor
                                └── seguranca  (se tocar auth/API/upload)
                                └── testador   (se exigir cobertura)
```

### 1. arquiteto
**Quando usar:** ANTES de qualquer feature, mudança de regra de negócio ou refatoração não-trivial.
**O que faz:** Lê PRD, spec, schema Prisma e código existente → produz plano de implementação + decisões técnicas (ADR).
**Não faz:** Não escreve código de produção.
**Acionado por:** "planeje X", "como fazemos Y", "implemente a página Z" (a primeira coisa a fazer é planejar).

### 2. implementador
**Quando usar:** APÓS o arquiteto entregar um plano, OU para mudanças pequenas e óbvias (fix de link, renomear variável).
**O que faz:** Escreve e altera código seguindo o plano e as convenções do spec.md.
**Não faz:** Não abre PRs, não roda testes E2E, não toma decisões arquiteturais.
**Acionado por:** "implemente o plano", "codifique X".

### 3. revisor
**Quando usar:** APÓS o implementador terminar, antes do merge.
**O que faz:** Revisa o diff em busca de bugs, regressões, performance, SEO, acessibilidade e violações do spec.
**Não faz:** Não reescreve código — aponta problemas com correções sugeridas.
**Acionado por:** "revise", "code review".

### 4. seguranca
**Quando usar:** Sempre que tocar endpoints públicos, auth admin, upload de arquivos ou qualquer dado de usuário.
**O que faz:** Audita validação/sanitização, rate limiting, auth, exposição de segredos, LGPD.
**Acionado por:** "revise a segurança de X", automaticamente após implementar /api/contact, /api/upload, /api/admin/*.

### 5. testador
**Quando usar:** Após a implementação de um fluxo de conversão, API route ou componente crítico.
**O que faz:** Escreve e roda testes (Vitest unit + Playwright E2E), reporta passou/falhou.
**Acionado por:** "teste X", "cubra o fluxo Y", "valide /api/contact".

---

## Regras gerais para todos os agentes

- **Params são Promise no Next.js 16.** Sempre `await params` antes de usar.
- **Zod v4** é a versão instalada. `z.string().email()`, `safeParse`, `error.issues` funcionam; confirme breaking changes antes de usar APIs avançadas.
- **Prisma v7** está instalado. Import: `import { PrismaClient } from '@prisma/client'`. Singleton em `src/lib/db.ts`.
- **Server Components por padrão.** `"use client"` apenas quando necessário (interatividade, hooks de browser).
- **Named exports** para todos os componentes exceto `page.tsx` e `layout.tsx`.
- **Sem comentários** salvo quando o WHY for não-óbvio.
