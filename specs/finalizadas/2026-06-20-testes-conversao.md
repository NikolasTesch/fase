# Testes Vitest Unit + Playwright E2E

> **Status:** `pendente`
> **ID:** `2026-06-20-testes-conversao`
> **Criada em:** 2026-06-13
> **Agente:** arquiteto

---

## Contexto

Garantir a estabilidade e a corretude dos fluxos de conversão do catálogo e do formulário é fundamental antes do lançamento em produção. Já temos a infraestrutura básica de testes unitários com Vitest rodando para utilitários e schemas. No entanto, não há cobertura de testes de ponta a ponta (E2E) para simular o comportamento real dos clientes e administradores na plataforma.

Esta especificação define a configuração do Playwright E2E e a escrita dos cenários críticos de teste (Fluxo A, Fluxo B, responsividade e autenticação admin).

---

## Objetivos

- [ ] Criar o arquivo de configuração do Playwright `playwright.config.ts` direcionado para a porta local `3000`.
- [ ] Criar cenários de teste E2E em `tests/e2e/conversion-flows.spec.ts`:
  - **Fluxo A:** Homepage → Categoria → Produto → Clique no WhatsApp (validando redirecionamento para wa.me).
  - **Fluxo B:** `/orcamento` → Preenchimento das 3 etapas → Envio → Verificação da tela de sucesso.
- [ ] Criar cenários de teste E2E em `tests/e2e/admin-auth.spec.ts`:
  - **Autenticação Admin:** Login no painel administrativo `/admin/login` → credenciais válidas e inválidas → redirecionamento ao dashboard `/admin/dashboard`.
- [ ] Criar cenário de responsividade mobile (375px):
  - Verificar visibilidade do menu colapsável (hambúrguer) e do FAB flutuante de WhatsApp.
- [ ] Adicionar scripts de teste E2E (`test:e2e`, `test:e2e:ui`) no `package.json`.

## Fora de escopo

- Testes de performance automatizados (cobertos via lighthouse/PageSpeed).
- Testes de regressão visual (ferramentas como Percy/Applitools estão fora do escopo inicial).
- Mocking completo de rede para APIs externas do Google Tag Manager (verificaremos se o GTM é injetado, mas não suas requisições internas).

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `playwright.config.ts` | criar | Configurações do ambiente de testes E2E (Browsers, baseURL, portas). |
| `tests/e2e/conversion-flows.spec.ts` | criar | Testes dos fluxos críticos de conversão pública (WhatsApp, formulário e mobile). |
| `tests/e2e/admin-auth.spec.ts` | criar | Testes de autenticação e proteção de rotas administrativas. |
| `package.json` | modificar | Adicionar scripts npm para facilitar a execução dos testes E2E. |

### Decisões técnicas (ADR)

**Mocks de Banco de Dados nos Testes E2E:**
Para evitar que testes E2E poluam o banco de dados de desenvolvimento ou falhem por falta de dados (categorias/produtos), os testes E2E rodarão no banco de desenvolvimento local (Docker Compose) pré-semeado (`npx prisma db seed`). Os testes que criam novos dados (ex: submissão de orçamento) farão limpezas ou usarão payloads de teste únicos e isolados.

---

## Estrutura dos Arquivos de Configuração

### `playwright.config.ts`
```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

---

## Checklist de Implementação

- [ ] 1. Criar o diretório de testes `tests/e2e/` se não existir.
- [ ] 2. Criar o arquivo `playwright.config.ts` na raiz do projeto.
- [ ] 3. Implementar `tests/e2e/conversion-flows.spec.ts` contendo:
  - Fluxo de navegação completo até wa.me (usando mocks do seed original).
  - Fluxo multi-step do formulário de orçamento com asserções de transições de telas.
  - Teste de viewport mobile (375px) com clique no botão hambúrguer.
- [ ] 4. Implementar `tests/e2e/admin-auth.spec.ts` testando fluxos de autenticação feliz/triste e proteção de rotas (tentar acessar `/admin` sem cookie de sessão).
- [ ] 5. Modificar `package.json` para adicionar:
  - `"test:e2e": "playwright test"`
  - `"test:e2e:ui": "playwright test --ui"`
- [ ] 6. Executar e garantir que todos os testes E2E passem localmente.

## Critérios de Aceitação

- [ ] Todos os testes E2E executam e passam em ambiente local usando `npm run test:e2e`.
- [ ] O teste de fluxo A valida que o link gerado para o WhatsApp contém `wa.me` com o número cadastrado no `.env` de testes.
- [ ] O teste de fluxo B valida a gravação do lead (pode ser verificado pela resposta da API ou checando a UI de sucesso).
- [ ] Tentativas de login com credenciais falsas no admin bloqueiam o acesso e exibem a mensagem de erro.
- [ ] Rota `/admin/dashboard` redireciona para `/admin/login` quando o cookie de JWT está ausente.
