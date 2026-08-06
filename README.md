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

### Google Drive (Artes)

As artes (logotipos, escudos, arquivos vetoriais) são armazenadas em uma pasta privada do Google Drive, acessada via conta de serviço — nunca há link público. Configuração:

1. **Criar projeto no Google Cloud** — acesse [Google Cloud Console](https://console.cloud.google.com), crie um projeto (ex: `fase-sport-arts`).
2. **Habilitar a Google Drive API** — em APIs & Services → Library, ative `Google Drive API` para o projeto.
3. **Criar a conta de serviço e baixar a chave JSON** — em IAM & Admin → Service Accounts, crie uma conta de serviço (ex: `arts-service-account`), gere uma chave no formato JSON e baixe o arquivo. Nunca commite esse arquivo no repositório.
4. **Criar a pasta no Drive e compartilhar com a conta de serviço** — crie uma pasta no Google Drive (ex: `Artes Fase Sport`), clique em Compartilhar e adicione o e-mail da conta de serviço (termine com `@<projeto>.iam.gserviceaccount.com`) com permissão **Editor**.
5. **Definir as variáveis no Vercel / `.env.local`** — copie o **conteúdo JSON inteiro** da chave (entre aspas simples) em `GOOGLE_SERVICE_ACCOUNT_JSON` e o ID da pasta (final da URL do Drive) em `GOOGLE_DRIVE_ARTS_FOLDER_ID`.

| Variável | Descrição |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Conteúdo JSON completo da chave da conta de serviço (ex: `{"type":"service_account",...}`) |
| `GOOGLE_DRIVE_ARTS_FOLDER_ID` | ID da pasta do Drive onde as artes são salvas (ex: `1xxxxxxxxxxxxxxxxxxxxxxxx`) |

### Chat Fabi (RAG / IA)

O widget de chat usa um provedor LLM para responder. Sem nenhuma chave configurada, a Fabi opera em **modo local** (motor por regras, sem IA). Escolha um provedor:

| Variável | Descrição |
|---|---|
| `AI_PROVIDER` | `opencode-go` (padrão) · `openrouter` · `local` |
| `OPENROUTER_API_KEY` | Chave da API do OpenRouter (para `openrouter`) |
| `OPENROUTER_MODEL` | Modelo no OpenRouter (padrão: `meta-llama/llama-3.3-70b-instruct:free`) |
| `OPENCODE_GO_API_KEY` | Chave para o provider opencode-go / OpenAI-compatível |
| `OPENCODE_GO_MODEL` | Modelo do provider opencode-go (padrão: `opencode-go/deepseek-v4-flash`) |
| `OPENCODE_GO_BASE_URL` | Base URL alternativa (padrão: `https://api.openai.com/v1`) |
| `OPENAI_API_KEY` | Alternativa OpenAI-compatível (usada como fallback de `OPENCODE_GO_API_KEY`) |
| `OPENAI_BASE_URL` | Base URL OpenAI (opcional) |
| `DEEPSEEK_API_KEY` | Alternativa DeepSeek (fallback do provider opencode-go) |

### Seed (usuários demo)

O seed cria o admin e as tags iniciais. Para criar um vendedor (T2) além do admin, defina as variáveis abaixo antes de rodar `npx prisma db seed`:

| Variável | Descrição |
|---|---|
| `ADMIN_SEED_EMAIL` | E-mail do usuário admin (T1) |
| `ADMIN_SEED_PASSWORD` | Senha do admin |
| `SELLER_SEED_EMAIL` | E-mail do vendedor demo (T2) — opcional |
| `SELLER_SEED_PASSWORD` | Senha do vendedor demo — opcional |

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
