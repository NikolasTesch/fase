# Polish e Deploy (Produção)

> **Status:** `pendente`
> **ID:** `2026-06-21-polish-e-deploy`
> **Criada em:** 2026-06-13
> **Agente:** arquiteto

---

## Contexto

Com o catálogo, formulários, SEO, acessibilidade e testes finalizados, o passo final é preparar o projeto para o deploy em produção de forma profissional. A stack de produção é Vercel + Neon DB + Cloudflare R2 + Resend + Upstash. Esta especificação define a automação de CI/CD (GitHub Actions), a configuração final do arquivo `vercel.json` e as etapas de revisão de variáveis de ambiente e segurança antes do lançamento oficial.

---

## Objetivos

- [ ] Criar a pipeline de integração contínua (CI/CD) com GitHub Actions em `.github/workflows/ci.yml`.
- [ ] Executar type-check, lint, build do Next.js e testes unitários na pipeline do GitHub.
- [ ] Revisar e estender a configuração do `vercel.json` (headers de segurança, redirecionamentos e configurações de cache de assets públicos).
- [ ] Mapear as variáveis de ambiente necessárias no Vercel (Production vs Preview).
- [ ] Definir a execução de testes de fumaça (Smoke Tests) automatizados pós-deploy no ambiente de staging/preview da Vercel.
- [ ] Verificar o funcionamento dinâmico do `sitemap.xml` e `robots.txt` com domínio de produção.

## Fora de escopo

- Configuração de domínios customizados no painel da Vercel ou Cloudflare (deve ser feito manualmente via painel do provedor de DNS).
- Setup de backups físicos do banco Postgres (o Neon realiza backups diários automáticos na modalidade Serverless).
- Implementação de monitoramento de performance com ferramentas de terceiros (como Sentry ou Datadog - os logs do Vercel e Vercel Speed Insights são suficientes na V1).

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `.github/workflows/ci.yml` | criar | Pipeline GitHub Actions para validação de código em Pull Requests e Deploy automatizado em merges para a branch `main`. |
| `vercel.json` | modificar | Configurar cabeçalhos de segurança HTTP (CORS, CSP básica, X-Content-Type, etc.) e redirects. |
| `next.config.ts` | modificar | Validar as diretivas de otimização de imagens (`images.remotePatterns` para o R2) e segurança. |

### Decisões técnicas (ADR)

**Segurança no vercel.json:**
Adicionaremos cabeçalhos HTTP de segurança recomendados (como HSTS, X-Frame-Options, X-Content-Type-Options e Referrer-Policy) diretamente pelo `vercel.json` em vez de middleware para evitar sobrecarga no runtime das Edge Functions da Vercel.

---

## Estrutura do GitHub Actions (`.github/workflows/ci.yml`)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run Prisma Client generator
        run: npx prisma generate
        
      - name: Run Linter
        run: npm run lint
        
      - name: Run TypeScript check
        run: npm run type-check
        
      - name: Run Unit Tests
        run: npm run test:unit
        
      - name: Run Next.js Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_BUILD }}
          NEXT_PUBLIC_APP_URL: https://fasesport.com.br
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

---

## Checklist de Implementação

- [ ] 1. Criar a pasta `.github/workflows/` se não existir.
- [ ] 2. Criar e salvar o arquivo `.github/workflows/ci.yml` com as validações automáticas.
- [ ] 3. Modificar o arquivo `vercel.json` para incluir os headers de segurança padrão:
  ```json
  {
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
        ]
      }
    ]
  }
  ```
- [ ] 4. Validar se o `sitemap.ts` utiliza dinamicamente a variável de ambiente `NEXT_PUBLIC_APP_URL`.
- [ ] 5. Criar a documentação final de deploy no `README.md` listando todas as variáveis de ambiente que o usuário precisa cadastrar na Vercel:
  * `DATABASE_URL` (Neon)
  * `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `NEXT_PUBLIC_R2_URL` (Cloudflare R2)
  * `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO_SALES` (Resend)
  * `JWT_SECRET`, `JWT_EXPIRES_IN` (jose / JWT)
  * `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (Upstash)
  * `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_SIMULATOR_URL` (WhatsApp & Simulador)

## Critérios de Aceitação

- [ ] A pipeline do GitHub Actions roda com sucesso em Pull Requests, validando Lint, Typecheck, Unit Tests e Next Build.
- [ ] A build local com `npm run build` executa e empacota o Next.js sem nenhum warning impeditivo.
- [ ] Cabeçalhos de segurança HTTP estão configurados no `vercel.json` e são aplicados aos requests.
- [ ] As URLs geradas no `sitemap.xml` apontam de forma dinâmica e absoluta para o domínio final configurado em `NEXT_PUBLIC_APP_URL`.
- [ ] Documentação de deploy descrita de forma clara no `README.md`.
