# Testes Unitários Vitest — Cobertura dos Gaps Restantes

> **Status:** `pendente`
> **ID:** `2026-06-13-unit-tests-vitest`
> **Criada em:** 2026-06-13 | **Revisada em:** 2026-06-20
> **Agente:** implementador

---

## Contexto

O projeto já tem 12 testes Vitest passando (`npm run test:unit`), organizados em `src/__tests__/`:

| Arquivo existente | Cobertura atual |
|---|---|
| `src/__tests__/lib/site.test.ts` | `buildWhatsAppUrl` — 4 cenários (URL válida, encoding, mensagem default, query param) |
| `src/__tests__/validations/contact.test.ts` | `ContactSchema` — 8 cenários (payload válido, email inválido, sport inválido, name curto, phone curto, quantity float, source default) |

**O que falta antes do lançamento:**
1. `LoginSchema` — nenhum teste existe; está exposto via `/api/admin/auth/login`
2. `OrcamentoForm` — componente React multi-step sem cobertura de comportamento de UI
3. `buildWhatsAppUrl` — guard de número ausente (retorna `"#"` em dev, `"/orcamento"` em prod) não está testado

O CI já roda `npm run test:unit` em todo PR. Os 12 testes passam. Este spec adiciona os 3 gaps restantes sem alterar o que já funciona.

---

## Estado atual da infra de testes (não alterar sem motivo)

```ts
// vitest.config.ts — estado atual
{
  test: {
    environment: "node",       // padrão para testes de lib/schema
    include: ["src/**/*.{test,spec}.{ts,tsx}"],  // glob correto
    globals: false,            // imports explícitos (describe, it, expect, vi)
  }
}
```

Dependências já instaladas (não reinstalar):
- `vitest` ✓
- `@testing-library/react` ✓
- `@testing-library/jest-dom` ✓
- `jsdom` ✓

`buildWhatsAppUrl` já está exportada de `src/lib/site.ts` — **não mover**.

---

## Objetivos

- [ ] Criar `src/__tests__/validations/auth.test.ts` — `LoginSchema`
- [ ] Criar `src/__tests__/lib/site-guard.test.ts` — guard sem número do WhatsApp
- [ ] Criar `src/__tests__/setup.ts` + atualizar `vitest.config.ts` com `setupFiles`
- [ ] Criar `src/__tests__/components/OrcamentoForm.test.tsx` — form multi-step (jsdom)
- [ ] `npm run test:unit` verde com ≥ 20 testes no total

## Fora de escopo

- Testes de integração com banco (requerem DB de teste)
- Testes de API Routes
- Testes Playwright E2E (já existem em `tests/e2e/`)
- Mocks de módulos Next.js (`next/navigation`, `next/image`) além do necessário para o form

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/__tests__/setup.ts` | criar | Setup global: importa `@testing-library/jest-dom` para matchers DOM |
| `vitest.config.ts` | modificar | Adicionar `setupFiles: ['./src/__tests__/setup.ts']` |
| `src/__tests__/validations/auth.test.ts` | criar | Testes do `LoginSchema` |
| `src/__tests__/lib/site-guard.test.ts` | criar | Guard de `buildWhatsAppUrl` sem número |
| `src/__tests__/components/OrcamentoForm.test.tsx` | criar | Testes do form multi-step (jsdom via docblock) |

### Estratégia de ambiente por arquivo

A config global usa `environment: "node"`. Testes de componentes React precisam de jsdom. A solução sem alterar a config global é o docblock por arquivo:

```ts
// src/__tests__/components/OrcamentoForm.test.tsx
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
// ...
```

Isso faz o Vitest usar jsdom apenas para esse arquivo, mantendo todos os outros em `node`.

### Decisões técnicas (ADR)

**ADR-1 — `setupFiles` global para jest-dom.**
`@testing-library/jest-dom` estende o `expect` do Vitest com matchers como `toBeInTheDocument()`, `toBeDisabled()`, etc. Importar uma vez em `setup.ts` vale para todos os arquivos. Em ambiente `node`, os matchers ficam disponíveis mas não causam erro.

**ADR-2 — `// @vitest-environment jsdom` por docblock, não `environmentMatchGlobs`.**
Mais explícito e sem mudar a config central. O docblock é lido pelo Vitest e garante que só aquele arquivo roda em jsdom.

**ADR-3 — Mock mínimo de `fetch` para o step de submit.**
`OrcamentoForm` usa `fetch('/api/contact', ...)` no submit. Usar `vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))` antes do teste de submit. Limpar com `vi.unstubAllGlobals()` em `afterEach`. Não mockar Zod, RHF nem Next.js Router.

**ADR-4 — Mock de `next/navigation` apenas se necessário.**
Se `useRouter` for chamado no componente durante o teste, mockar: `vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))`. Verificar se `OrcamentoForm` chama `useRouter` — ele não chama, então o mock pode ser desnecessário.

---

## Checklist de Implementação

- [ ] 1. Criar `src/__tests__/setup.ts`:
  ```ts
  import "@testing-library/jest-dom";
  ```

- [ ] 2. Modificar `vitest.config.ts` para adicionar `setupFiles`:
  ```ts
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    globals: false,
    setupFiles: ["./src/__tests__/setup.ts"],
  }
  ```

- [ ] 3. Criar `src/__tests__/validations/auth.test.ts`:
  ```ts
  import { describe, it, expect } from "vitest";
  import { LoginSchema } from "@/lib/validations/auth";

  describe("LoginSchema", () => {
    it("aceita credenciais válidas", () => {
      const r = LoginSchema.safeParse({ email: "admin@fasesport.com", password: "senha123" });
      expect(r.success).toBe(true);
    });

    it("rejeita e-mail malformado", () => {
      const r = LoginSchema.safeParse({ email: "nao-email", password: "senha123" });
      expect(r.success).toBe(false);
      if (!r.success) expect(r.error.issues.some(i => i.path.includes("email"))).toBe(true);
    });

    it("rejeita senha com menos de 8 caracteres", () => {
      const r = LoginSchema.safeParse({ email: "admin@fasesport.com", password: "123" });
      expect(r.success).toBe(false);
      if (!r.success) expect(r.error.issues.some(i => i.path.includes("password"))).toBe(true);
    });

    it("rejeita payload sem password", () => {
      const r = LoginSchema.safeParse({ email: "admin@fasesport.com" });
      expect(r.success).toBe(false);
    });
  });
  ```

- [ ] 4. Criar `src/__tests__/lib/site-guard.test.ts`:
  ```ts
  import { describe, it, expect, beforeEach, afterEach } from "vitest";
  import { buildWhatsAppUrl } from "@/lib/site";

  describe("buildWhatsAppUrl — guard sem número", () => {
    const original = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

    beforeEach(() => {
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "";
    });

    afterEach(() => {
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = original;
    });

    it("retorna '/orcamento' quando número não está configurado (produção)", () => {
      // NODE_ENV não é 'development' no Vitest por padrão
      const url = buildWhatsAppUrl();
      expect(url).toBe("/orcamento");
      expect(url).not.toContain("wa.me");
    });
  });
  ```

- [ ] 5. Criar `src/__tests__/components/OrcamentoForm.test.tsx`.
  Cenários obrigatórios:
  - Renderiza Step 1 (heading "Modalidade", select `#sport`, input `#quantity`)
  - Clicar "Próximo" sem preencher `sport` mantém no Step 1 e exibe erro de validação
  - Preencher `sport` + `quantity` + clicar "Próximo" avança para Step 2 (heading "Personalização")
  - Avançar para Step 3 exibe campos de contato (`#name`, `#email`, `#phone`, `#city`)
  - Preencher Step 3 e clicar "Enviar orçamento" chama `fetch('/api/contact', ...)` com os dados dos 3 steps

  Mock necessário:
  ```ts
  // @vitest-environment jsdom
  import { vi, describe, it, expect, beforeEach } from "vitest";
  import { render, screen, waitFor } from "@testing-library/react";
  import userEvent from "@testing-library/user-event";
  import { OrcamentoForm } from "@/components/forms/OrcamentoForm";

  beforeEach(() => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "5527999999999";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });
  ```

  Notas de implementação:
  - Usar `userEvent.setup()` (não `userEvent` legacy) para interações realistas
  - `userEvent.selectOptions(screen.getByRole('combobox'), 'futebol')` para o select
  - O botão "Próximo" tem `data-testid="next-step"` — usar `screen.getByTestId("next-step")`
  - O botão "Enviar orçamento" tem `data-testid="submit-form"`
  - A tela de sucesso tem `data-testid="form-success"`
  - `OrcamentoForm` usa `trackEvent` de `@/lib/analytics` — se causar erro, mockar: `vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }))`

- [ ] 6. Rodar `npm run test:unit` e garantir 0 falhas, ≥ 20 testes no total
- [ ] 7. Rodar `npm run type-check`

## Critérios de Aceitação

- [ ] `npm run test:unit` reporta ≥ 20 testes, 0 falhas
- [ ] Os 12 testes existentes continuam passando sem alteração
- [ ] `LoginSchema` cobre: válido, email inválido, senha curta, payload incompleto
- [ ] Guard de `buildWhatsAppUrl` confirma que `""` como número nunca gera `wa.me/`
- [ ] `OrcamentoForm` Step 1→2→3→submit cobre o happy path
- [ ] `OrcamentoForm` bloqueia avanço sem `sport` preenchido e exibe erro
- [ ] `npm run type-check` limpo

---

## Notas

- Não alterar os arquivos de teste existentes (`site.test.ts`, `contact.test.ts`) — eles passam e cobrem seus casos
- O `OrcamentoForm` chama `buildWhatsAppUrl()` no render da tela de sucesso — configurar `NEXT_PUBLIC_WHATSAPP_NUMBER` no `beforeEach` evita warning de console
- `@testing-library/user-event` v14+ usa API assíncrona: `const user = userEvent.setup(); await user.click(...)`
- Se `OrcamentoForm` importar `next/link` ou `next/image`, o jsdom vai renderizá-los como elementos HTML normais — sem necessidade de mock
