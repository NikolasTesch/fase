# Deploy e Infraestrutura de Produção

> **Status:** `pendente`
> **ID:** `2026-06-13-deploy-producao`
> **Criada em:** 2026-06-13
> **Agente:** implementador

---

## Contexto

O código V1 está completo (25 specs finalizadas). O único bloqueante para lançamento é a configuração da infraestrutura de produção: projeto no Vercel, banco de dados Neon produção, bucket R2, Upstash Redis, Resend com domínio verificado e seed inicial do admin.

Sem essa configuração, o CI/CD não tem para onde fazer deploy e o site não vai ao ar.

---

## Objetivos

- [ ] Criar projeto no Vercel e conectar ao repositório GitHub
- [ ] Configurar todas as variáveis de ambiente de produção no Vercel
- [ ] Criar banco Neon de produção e rodar migrations + seed
- [ ] Criar bucket R2 de produção (separado do dev) e configurar CORS
- [ ] Verificar domínio de envio de email no Resend
- [ ] Configurar domínio `fasesport.com.br` no Vercel
- [ ] Confirmar que o CI (`npm run test:unit`, `type-check`, `build`) passa no deploy

## Fora de escopo

- Configuração de CDN customizado para imagens (R2 já é o CDN)
- Google Analytics data stream (configurado no GTM, não no código)
- Monitoramento de erros (Sentry) — pós-launch
- Múltiplos environments (staging) — V1 usa apenas produção

---

## Abordagem Técnica

### Variáveis de ambiente necessárias

| Variável | Origem | Descrição |
|---|---|---|
| `DATABASE_URL` | Neon → Connection string | Pool mode (pgbouncer) para Vercel serverless |
| `DIRECT_URL` | Neon → Direct connection | Para migrations (`prisma migrate deploy`) |
| `JWT_SECRET` | Gerar: `openssl rand -base64 32` | 32+ chars, único para produção |
| `ADMIN_SEED_EMAIL` | Definir com equipe Fase | Email do admin inicial |
| `ADMIN_SEED_PASSWORD` | Definir com equipe Fase | Senha forte, 12+ chars |
| `RESEND_API_KEY` | Resend dashboard | Chave da conta Resend |
| `EMAIL_TO_SALES` | Fase Sport | Email que recebe os leads |
| `EMAIL_FROM` | Resend | Ex: `noreply@fasesport.com.br` (domínio verificado) |
| `CLOUDFLARE_ACCOUNT_ID` | R2 dashboard | ID da conta Cloudflare |
| `CLOUDFLARE_ACCESS_KEY_ID` | R2 → API Tokens | Token com permissão R2 |
| `CLOUDFLARE_SECRET_ACCESS_KEY` | R2 → API Tokens | Secret do token |
| `R2_BUCKET_NAME` | Definir | Ex: `fase-sport-prod` |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | R2 → Custom domain | Ex: `https://assets.fasesport.com.br` |
| `UPSTASH_REDIS_REST_URL` | Upstash dashboard | URL da instância Redis |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash dashboard | Token de acesso |
| `NEXT_PUBLIC_APP_URL` | Definir | `https://fasesport.com.br` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Fase Sport | Ex: `5527999999999` (apenas dígitos) |
| `NEXT_PUBLIC_SIMULATOR_URL` | Fase Sport | `https://simulador.fasesport.com` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics | Ex: `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager | Ex: `GTM-XXXXXXX` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Cloud | Chave para Maps embed (opcional na V1) |

### Schema Prisma e Neon

O `schema.prisma` já tem suporte a `directUrl` (necessário para pooling no Neon):

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")       // pool mode (pgbouncer)
  directUrl = env("DIRECT_URL")         // direto, para migrations
}
```

### Bucket R2

CORS mínimo necessário para upload do admin (`/api/admin/upload`):

```json
[
  {
    "AllowedOrigins": ["https://fasesport.com.br", "https://admin.fasesport.com.br"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"]
  }
]
```

### Decisões técnicas (ADR)

**ADR-1 — Pool mode no Neon para Vercel.**
Vercel usa funções serverless com cold starts. O Neon em pool mode (pgbouncer) aguenta conexões simultâneas sem esgotar o pool. `DATABASE_URL` usa `?pgbouncer=true&connection_limit=1`; `DIRECT_URL` aponta para a conexão direta (sem pgbouncer) para o Prisma rodar migrations.

**ADR-2 — Seed de produção com variáveis de ambiente.**
O `prisma/seed.ts` usa `ADMIN_SEED_EMAIL` e `ADMIN_SEED_PASSWORD`. Rodar o seed via `npx prisma db seed` após o primeiro deploy cria o admin inicial. Não commitar credenciais no código.

**ADR-3 — Domínio R2 separado.**
Assets de produção ficam em `assets.fasesport.com.br` (subdomínio CNAME para o bucket R2). Isso permite cache headers próprios e desacopla a URL de assets do Vercel.

---

## Checklist de Implementação

- [ ] 1. Criar banco Neon de produção:
  - Criar projeto em `console.neon.tech`
  - Obter connection string pool mode (`DATABASE_URL`) e direct (`DIRECT_URL`)

- [ ] 2. Criar instância Upstash Redis:
  - Criar em `console.upstash.com` (região us-east-1)
  - Obter `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`

- [ ] 3. Criar bucket R2 de produção:
  - Nome: `fase-sport-prod`
  - Configurar CORS (ver acima)
  - Criar API Token com permissão R2 read+write
  - Configurar custom domain: `assets.fasesport.com.br` → bucket R2

- [ ] 4. Verificar domínio no Resend:
  - Adicionar `fasesport.com.br` no Resend
  - Adicionar registros DNS (SPF, DKIM, DMARC) no registrador
  - Confirmar verificação verde no painel Resend

- [ ] 5. Criar projeto no Vercel:
  - Conectar ao repositório GitHub (branch `main`)
  - Framework: Next.js (auto-detectado)
  - Build command: `npm run build`
  - Output: `.next`
  - Adicionar todas as variáveis de ambiente (tabela acima)

- [ ] 6. Configurar domínio no Vercel:
  - Adicionar `fasesport.com.br` e `www.fasesport.com.br`
  - Atualizar registros DNS: A/CNAME apontando para Vercel

- [ ] 7. Rodar primeiro deploy e migrations:
  ```bash
  # Localmente, com DATABASE_URL apontando para produção:
  npx prisma migrate deploy
  npx prisma db seed
  ```

- [ ] 8. Verificar deploy no Vercel:
  - CI verde (type-check + unit tests + build)
  - `https://fasesport.com.br` retorna 200
  - `https://fasesport.com.br/admin/login` retorna 200
  - Login com `ADMIN_SEED_EMAIL` + `ADMIN_SEED_PASSWORD` funciona
  - `POST /api/contact` retorna 201 (testar com Postman/curl)
  - Email de lead chega na caixa de `EMAIL_TO_SALES`

- [ ] 9. Configurar Google Search Console:
  - Adicionar propriedade `fasesport.com.br`
  - Verificar via DNS
  - Submeter `https://fasesport.com.br/sitemap.xml`

- [ ] 10. Rodar `npm run type-check` e `npm run test:unit` localmente para confirmar tudo verde antes do deploy

## Critérios de Aceitação

- [ ] `https://fasesport.com.br` carrega a homepage sem erros no console
- [ ] Login admin funciona com as credenciais de produção
- [ ] Formulário de orçamento salva lead no banco e envia email de notificação
- [ ] Upload de imagem no admin cria arquivo no bucket R2 de produção
- [ ] Rate limiting ativo: 6ª requisição ao `/api/contact` no mesmo IP retorna 429
- [ ] `sitemap.xml` acessível em `/sitemap.xml`
- [ ] Lighthouse Performance ≥ 80 na homepage

---

## Notas

- Neon connection string com pool mode: `postgres://user:pass@host/dbname?sslmode=require&pgbouncer=true&connection_limit=1`
- Neon direct URL (sem pgbouncer): `postgres://user:pass@host/dbname?sslmode=require`
- O `vercel.json` já tem headers de segurança HTTP configurados — verificar se estão sendo aplicados
- Para testar o email antes do go-live: mudar `EMAIL_TO_SALES` para um email pessoal e submeter um lead
- Se `NEXT_PUBLIC_WHATSAPP_NUMBER` estiver vazio, o `buildWhatsAppUrl()` retorna `"/orcamento"` (guard já implementado)
