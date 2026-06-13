# Testes Unitários Vitest

> **Status:** `pendente`
> **ID:** `2026-06-13-unit-tests-vitest`
> **Criada em:** 2026-06-13
> **Agente:** implementador

---

## Contexto

O CI (`.github/workflows/ci.yml`) já executa `npm run test:unit` em todo push para `main` e todo PR. O `vitest.config.ts` existe na raiz, mas não há nenhum arquivo de teste em `tests/unit/`. O CI vai falhar na primeira execução real de pipeline por ausência de testes.

As funções críticas de negócio (validação de leads, auth, geração de URL de WhatsApp) e o componente de orçamento (form multi-step com 3 steps) têm lógica não-trivial que precisa de cobertura antes do lançamento.

**Impacto de não fazer:** CI quebra em produção. Bugs de regressão em validação Zod e geração de URL WhatsApp passam despercebidos.

---

## Objetivos

- [ ] Criar a pasta `tests/unit/` com pelo menos um arquivo de setup
- [ ] Cobrir `ContactSchema` com casos válidos e inválidos
- [ ] Cobrir `LoginSchema` com casos válidos e inválidos
- [ ] Cobrir `buildWhatsAppUrl` (com número, sem número, com produto, sem produto)
- [ ] Cobrir `OrcamentoForm` (renderiza step 1, avança para step 2 ao preencher campos válidos, bloqueia avanço sem campos obrigatórios)
- [ ] `npm run test:unit` passando verde localmente e no CI

## Fora de escopo

- Testes de integração com banco de dados (requerem DB de teste — V2)
- Testes de API Routes
- Testes Playwright E2E (já existem em `tests/e2e/`)
- Cobertura de 100% — foco nos caminhos críticos de conversão

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `tests/unit/validations/contact.test.ts` | criar | Testes do ContactSchema (Zod) |
| `tests/unit/validations/auth.test.ts` | criar | Testes do LoginSchema (Zod) |
| `tests/unit/lib/whatsapp.test.ts` | criar | Testes de `buildWhatsAppUrl` |
| `tests/unit/components/OrcamentoForm.test.tsx` | criar | Testes do form multi-step |
| `tests/unit/setup.ts` | criar | Setup global do Vitest (jest-dom matchers) |
| `vitest.config.ts` | verificar | Confirmar que `setupFiles` aponta para `./tests/unit/setup.ts` |

### Decisões técnicas (ADR)

**ADR-1 — `@testing-library/react` para componentes.**
`OrcamentoForm` é um Client Component com React Hook Form + Zod + estados internos de step. `@testing-library/react` com `userEvent` cobre as interações sem acoplar ao DOM interno.

**ADR-2 — Mocks mínimos.**
`OrcamentoForm` chama `POST /api/contact` no submit. Mockar apenas o `fetch` global com `vi.fn()` para o step de submit, sem mockar Zod ou React Hook Form.

**ADR-3 — `buildWhatsAppUrl` é testada via import direto.**
Verificar se a função está exportada de `src/lib/site.ts`. Se estiver inline em componente, extraí-la para `src/lib/whatsapp.ts` antes de testar.

---

## Checklist de Implementação

- [ ] 1. Verificar `vitest.config.ts`: confirmar `environment: 'jsdom'`, `globals: true`, `setupFiles: ['./tests/unit/setup.ts']`
- [ ] 2. Instalar dependências de teste se ausentes: `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`
- [ ] 3. Criar `tests/unit/setup.ts`:
  ```ts
  import '@testing-library/jest-dom'
  ```
- [ ] 4. Criar `tests/unit/validations/contact.test.ts` cobrindo:
  - payload completo válido → `safeParse` retorna `success: true`
  - e-mail inválido → erro em `email`
  - esporte não listado no enum → erro em `sport`
  - `name` com menos de 2 chars → erro em `name`
  - `phone` ausente → erro em `phone`
  - campo `source` omitido → default `'form'` aplicado
- [ ] 5. Criar `tests/unit/validations/auth.test.ts` cobrindo:
  - credenciais válidas → `success: true`
  - e-mail malformado → erro em `email`
  - senha vazia → erro em `password`
- [ ] 6. Localizar `buildWhatsAppUrl` (provavelmente em `src/lib/site.ts`). Se não estiver exportada separadamente, extraí-la para `src/lib/whatsapp.ts` e atualizar os imports dos componentes que a usam
- [ ] 7. Criar `tests/unit/lib/whatsapp.test.ts` cobrindo:
  - número válido + produto + modalidade → URL `https://wa.me/55XX...?text=...` com nome do produto
  - número válido sem produto → mensagem genérica
  - número vazio / undefined → retorna URL de fallback (ex: `/orcamento`) e não `wa.me/`
- [ ] 8. Criar `tests/unit/components/OrcamentoForm.test.tsx` cobrindo:
  - renderiza Step 1 (campo sport + quantity) na montagem inicial
  - preencher sport + quantity + clicar "Próximo" avança para Step 2
  - tentar avançar com sport vazio mantém no Step 1 e exibe erro
  - Step 3 completo + submit chama `fetch('/api/contact', ...)` com os dados dos 3 steps
- [ ] 9. Rodar `npm run test:unit` e garantir 0 falhas
- [ ] 10. Rodar `npm run type-check` para confirmar sem erros de tipagem nos arquivos de teste

## Critérios de Aceitação

- [ ] `npm run test:unit` executa e reporta verde (0 falhas, ≥ 12 testes)
- [ ] CI roda `unit tests` sem erro após push para qualquer branch
- [ ] `ContactSchema` cobre os 6 cenários listados
- [ ] `buildWhatsAppUrl` nunca gera `wa.me/` sem número (guard testado)
- [ ] `OrcamentoForm` avança steps corretamente e bloqueia sem campos obrigatórios

---

## Notas

- `vitest.config.ts` já existe na raiz — não criar um novo, apenas verificar/ajustar
- `tests/e2e/` já contém Playwright — não confundir com Vitest
- Se `@testing-library/*` não estiver instalado: `npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom`
- Manter testes unitários rápidos: sem `await`, sem `setTimeout`, sem IO real
