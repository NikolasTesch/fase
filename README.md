# Fase Sport

Plataforma web de catálogo e conversão para a Fase Sport — loja de uniformes esportivos personalizados em Colatina-ES.

## Stack

- **Framework:** Next.js 16 App Router
- **UI:** React 19 + Tailwind CSS 4 + shadcn/ui
- **ORM:** Prisma 7 (Neon Postgres)
- **Storage:** Cloudflare R2 (AWS SDK v3)
- **E-mail:** Resend
- **Auth:** JWT via jose + bcryptjs
- **Rate limit:** Upstash Redis

## Desenvolvimento local

```bash
npm install
cp .env.example .env.local   # preencha as variáveis abaixo
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

## Variáveis de ambiente

Configure todas as variáveis no painel da Vercel (Settings → Environment Variables) para os ambientes **Production** e **Preview**.

### Banco de dados (Neon)

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string do Neon Postgres (pooled) |

### Storage (Cloudflare R2)

| Variável | Descrição |
|---|---|
| `R2_ACCOUNT_ID` | ID da conta Cloudflare |
| `R2_ACCESS_KEY_ID` | Access key do bucket R2 |
| `R2_SECRET_ACCESS_KEY` | Secret key do bucket R2 |
| `R2_BUCKET_NAME` | Nome do bucket (ex: `fase-media`) |
| `NEXT_PUBLIC_R2_URL` | URL pública do bucket (ex: `https://media.fasesport.com`) |

### E-mail (Resend)

| Variável | Descrição |
|---|---|
| `RESEND_API_KEY` | API key do Resend |
| `EMAIL_FROM` | Remetente (ex: `noreply@fasesport.com`) |
| `EMAIL_TO_SALES` | Destinatário dos leads (ex: `vendas@fasesport.com`) |

### Autenticação admin (JWT)

| Variável | Descrição |
|---|---|
| `JWT_SECRET` | Secret para assinar tokens (mín. 32 caracteres aleatórios) |
| `JWT_EXPIRES_IN` | Expiração do token (ex: `7d`) |

### Rate limiting (Upstash Redis)

| Variável | Descrição |
|---|---|
| `UPSTASH_REDIS_REST_URL` | URL REST do Upstash Redis |
| `UPSTASH_REDIS_REST_TOKEN` | Token de autenticação do Upstash |

### Integrações públicas

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número WhatsApp sem formatação (ex: `5527999999999`) |
| `NEXT_PUBLIC_SIMULATOR_URL` | URL do simulador de uniforme (opcional) |
| `NEXT_PUBLIC_APP_URL` | URL canônica do site (ex: `https://fasesport.com.br`) |

## Scripts

```bash
npm run dev          # servidor de desenvolvimento
npm run build        # build de produção
npm run lint         # ESLint
npm run type-check   # TypeScript sem emitir
npm run test:unit    # Vitest (testes unitários)
npm run test:e2e     # Playwright E2E (requer servidor rodando)
npm run test:e2e:ui  # Playwright com UI interativa
```

## Deploy

O projeto é publicado automaticamente na Vercel via GitHub Actions a cada push na branch `main`. O pipeline valida lint, typecheck, testes unitários e o build antes de publicar.

Para deploy manual:
```bash
vercel --prod
```
