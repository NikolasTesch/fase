# Seção "Viva sua nova fase" + Grid Instagram na Homepage

> **Status:** `pendente`
> **ID:** `2026-06-14-instagram-section`
> **Criada em:** 2026-06-14
> **Agente:** arquiteto

---

## Contexto

A homepage atual não tem prova social visual além dos depoimentos em texto. A Fase Sport tem presença ativa no Instagram com fotos de produtos reais — exibir esses posts curados aumenta confiança e engajamento. A seção também inclui um hero com vídeo loop para reforçar a identidade de marca com uma mensagem emocional.

## Objetivos

- [ ] Adicionar hero lateral ("Viva sua nova fase" + CTA WhatsApp à esquerda, vídeo loop à direita)
- [ ] Adicionar grid 3×2 de posts do Instagram curados manualmente pelo admin
- [ ] Admin gerencia os 6 posts (imagem via R2 + URL de redirecionamento) pela página `/admin/instagram`
- [ ] Admin gerencia a URL do vídeo do hero via tabela `SiteSetting` (sem redeploy)

## Fora de escopo

- Integração com a API real do Instagram (OAuth, webhooks, pull automático)
- Lightbox ou modal ao clicar no post
- Analytics por post individual (click tracking por post)
- Paginação ou mais de 6 posts na home
- **Upload de vídeo via route handler** — limite real do Vercel para route handlers Node.js é ~4.5 MB e a sintaxe `bodyParser` do Pages Router não funciona no App Router (Next 16). Upload de vídeo será spec futura usando presigned URL direto ao R2.
- Presigned URL direto ao R2 para upload de vídeo (V2)

---

## Abordagem Técnica

### Visão geral

A seção é dividida em duas partes contíguas, implementadas como um único Server Component `InstagramSection`. Posição na home: **ao final da página, após `<CtaBannerSection />`**. (`TestimonialsSection` não existe mais — foi substituída por `TestimonialsCarousel` pela spec `homepage-depoimentos-carousel`.)

**Parte 1 — Hero lateral:**
- 2 colunas no desktop (`lg:grid-cols-2`), empilhado no mobile
- Esquerda: título `<h2>Viva sua nova fase</h2>` + botão WhatsApp (`buildWhatsAppUrl()`, nova aba)
- Direita: `<HeroVideo>` (Client) com `autoPlay muted loop playsInline`, sem controles; respeita `prefers-reduced-motion` (pausa quando ativo); se `videoUrl` for `null`, coluna é omitida

**Parte 2 — Grid Instagram:**
- Título `<h2>Faça como esses campeões</h2>`
- Grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, 6 cards `aspect-square`
- Cada card: `<a href={linkUrl} target="_blank" rel="noopener noreferrer">` + `next/image` com `fill`, `sizes`, `alt={caption ?? "Post Fase Sport"}`
- Se `posts.length === 0`, a parte 2 não é renderizada (sem bloco vazio)

### Modelo de dados

```prisma
// Adicionar em prisma/schema.prisma

model InstagramPost {
  id          String   @id @default(cuid())
  imageUrl    String
  linkUrl     String
  caption     String?
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model SiteSetting {
  key       String   @id
  value     String
  updatedAt DateTime @updatedAt
}
```

- Chave usada: `"instagram_hero_video_url"` — string contendo URL do vídeo no R2 (ou URL externa)
- Posts criados via UI (botão "Adicionar post" → POST `/api/admin/instagram`)

### Gerenciamento da URL do vídeo

Sem upload via route handler (removido do escopo — ver "Fora de escopo"). O admin gerencia o vídeo informando manualmente a URL no painel:
- `HeroVideoUploader` é um simples campo `<input type="url">` + botão "Salvar"
- Ao salvar, chama `PATCH /api/admin/site-setting` com `{ key: "instagram_hero_video_url", value: url }`
- Rota faz `upsert` em `SiteSetting` e retorna `{ url }`
- O admin hospeda o vídeo onde preferir (R2 via Wrangler/painel, YouTube, etc.) e cola a URL

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `prisma/schema.prisma` | modificar | Adicionar `InstagramPost` e `SiteSetting` |
| `src/lib/site-settings.ts` | criar | `getSiteSetting(key)` e `upsertSiteSetting(key, value)` — Server-only |
| `src/app/api/admin/site-setting/route.ts` | criar | `PATCH` upsert de `SiteSetting` (Zod: `{ key, value }`) — protegido pelo `middleware.ts` |
| `src/app/api/admin/instagram/route.ts` | criar | `GET` lista + `POST` cria post (Zod) |
| `src/app/api/admin/instagram/[id]/route.ts` | criar | `PATCH` + `DELETE` (await params — Next 16) |
| `src/app/(admin)/admin/instagram/_components/InstagramPostRow.tsx` | criar | Client — row de post (upload img, inputs linkUrl/caption/sortOrder, toggle isActive, delete) |
| `src/app/(admin)/admin/instagram/_components/HeroVideoUploader.tsx` | criar | Client — preview do vídeo atual + `<input type="url">` para colar URL + botão Salvar (chama PATCH `/api/admin/site-setting`) |
| `src/app/(admin)/admin/instagram/page.tsx` | criar | Server Component `force-dynamic`, seção de vídeo + grid de posts |
| `src/app/(admin)/layout.tsx` | modificar | Adicionar nav item "Instagram" (ícone `Instagram` do lucide-react) |
| `src/components/sections/HeroVideo.tsx` | criar | Client — `<video autoPlay muted loop playsInline>` + botão pause para reduced-motion |
| `src/components/sections/InstagramSection.tsx` | criar | Server Component — hero lateral + grid; usa `RevealOnScroll`, `buildWhatsAppUrl`, `HeroVideo` |
| `src/app/(marketing)/page.tsx` | modificar | Adicionar queries no `Promise.all`, mapear props, inserir `<InstagramSection>` após `<CtaBannerSection>` (última seção) |

### Decisões técnicas (ADR)

**ADR-1 — `InstagramPost` como tabela dedicada (vs. JSON em config).**
Tabela própria mantém consistência com `Category`/`Testimonial` (mesmo padrão `sortOrder`/`isActive`), permite validação tipada via Prisma, facilita reordenação futura. Custo: 1 migração a mais. Trade-off aceitável.

**ADR-2 — `SiteSetting` key/value para URL do vídeo.**
Requisito explícito: admin troca o vídeo sem redeploy. Alternativa `.env` exigiria redeploy. A tabela `SiteSetting` também pode ser reutilizada para outras configs futuras (telefone, mensagem padrão WhatsApp, etc.).

**ADR-3 — `HeroVideo` como Client Component separado.**
`<video autoPlay>` funciona como atributo HTML em Server Component, mas para respeitar `prefers-reduced-motion` (WCAG 2.2.2 — vídeo em loop deve poder ser pausado) e adicionar botão de pausa, é necessário um Client Component. Extrair apenas o vídeo, mantendo `InstagramSection` como Server.

---

## Checklist de Implementação

- [ ] 1. Adicionar `InstagramPost` e `SiteSetting` em `prisma/schema.prisma`
- [ ] 2. Rodar migração Prisma 7: `prisma migrate dev --name instagram-section`
- [ ] 3. Criar `src/lib/site-settings.ts` com `getSiteSetting` e `upsertSiteSetting`
- [ ] 4. Criar `src/app/api/admin/site-setting/route.ts` (PATCH — upsert `SiteSetting` com Zod)
- [ ] 5. Criar `src/app/api/admin/instagram/route.ts` (GET + POST com Zod)
- [ ] 6. Criar `src/app/api/admin/instagram/[id]/route.ts` (PATCH + DELETE, `await params`)
- [ ] 7. Criar `InstagramPostRow.tsx` (Client, padrão CategoryRow)
- [ ] 8. Criar `HeroVideoUploader.tsx` (Client, preview + upload)
- [ ] 9. Criar `src/app/(admin)/admin/instagram/page.tsx` (Server, `force-dynamic`)
- [ ] 10. Adicionar "Instagram" no nav de `src/app/(admin)/layout.tsx`
- [ ] 11. Criar `src/components/sections/HeroVideo.tsx` (Client, `prefers-reduced-motion`)
- [ ] 12. Criar `src/components/sections/InstagramSection.tsx` (Server, hero + grid)
- [ ] 13. Modificar `src/app/(marketing)/page.tsx` — queries + `<InstagramSection>` após `<CtaBannerSection>` (última posição)
- [ ] 14. Acionar **seguranca** (upload-video + endpoints admin)
- [ ] 15. Acionar **testador** (CRUD de posts + render da seção)

## Critérios de Aceitação

- [ ] Admin consegue acessar `/admin/instagram`, fazer upload de vídeo e ver o preview
- [ ] Admin consegue adicionar, editar (imagem, link, ordem, ativo) e remover posts
- [ ] Homepage exibe o hero lateral com vídeo loop (quando URL configurada) e CTA WhatsApp
- [ ] Homepage exibe grid 3×2 com os 6 posts ativos em ordem de `sortOrder`
- [ ] Clicar em cada post abre o link em nova aba
- [ ] Com `prefers-reduced-motion`, o vídeo não reproduz e um botão de play é exibido
- [ ] Se nenhum post estiver cadastrado/ativo, a parte do grid não aparece na home
- [ ] TypeScript sem erros, `npm run type-check` passa
- [ ] `npm run test:unit` continua passando (26 testes)

---

## Notas

- **Upload de vídeo removido do escopo** — vídeo é gerenciado via URL de texto no admin. Para upload direto ao R2, criar spec futura com presigned URL.
- O ícone `Instagram` existe no `lucide-react` instalado — confirmar antes de usar
- `buildWhatsAppUrl()` existe em **`src/lib/site.ts`** (não em `analytics.ts`) — importar do local correto
- Posts inativos (`isActive: false`) não aparecem na home mas ficam preservados no banco
- Os endpoints `/api/admin/*` já são protegidos pelo `middleware.ts` (matcher `/api/admin/:path*`) — não reimplementar autenticação
