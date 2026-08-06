# Evidência — Task 14: Página /admin/conteudo (abas Artes | Tags)

**Plano:** `.omo/plans/admin-roles-artes-produtos-grid.md` (todo 14, linhas 431-450)
**Data:** 2026-08-06
**Status:** ✅ Concluído

## O que foi feito

### Arquivos criados

1. **`src/app/(admin)/admin/conteudo/page.tsx`** (Server Component)
   - `export const dynamic = "force-dynamic";`
   - `const user = await requireAdmin();` (redireciona para /admin/login se não autenticado)
   - Busca `prisma.artTag.findMany({ orderBy: { name: "asc" } })` e `prisma.artFile.findMany({ include: { tags: true, createdBy: { select: { name: true } } }, orderBy: { createdAt: "desc" } })` em `Promise.all`
   - Renderiza `<ConteudoClient tags={tags} arts={arts} role={user.role} userId={user.id} />`
   - Metadata: `Conteúdo — Admin Fase Sport`

2. **`src/app/(admin)/admin/conteudo/_components/ConteudoClient.tsx`** ("use client")
   - Props: `{ tags: ArtTag[], arts: (ArtFile & { tags, createdBy })[], role: AdminRole, userId: string }` (tipos type-only de `@prisma/client`)
   - **Tabs** via `useState<"artes" | "tags">` com botões estilizados (sem componente Tabs no codebase); aba **Tags oculta para T2_VENDEDOR**
   - **Aba Artes:**
     - Toolbar: input de busca (filtra por nome/descrição, client-side) + pills de tags com contagem ("Todas" + uma por tag, toggle) + botão "Nova arte" (visível a T1 e T2)
     - Grid `sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` de cards: `<img src={"/api/admin/arts/" + id + "/preview"} loading="lazy" className="h-full w-full object-cover">` (mesmo-origin, sem next/image por ser rota autenticada), nome, descrição truncada (`line-clamp-2`), pills de tags, rodapé "por {createdBy?.name} · {data pt-BR}"
     - Ações: "Baixar" (`<a href={"/api/admin/arts/" + id + "/download"}>` via `Button render`), "Editar" e "Excluir" **apenas se `role === "T1_GERENCIA" || art.createdById === userId`**
     - Estados vazios: sem artes → mensagem + CTA "Adicionar primeira arte"; filtro sem resultado → "Nenhuma arte encontrada."
   - **Dialog "Nova arte"** (controlado, padrão base-ui como MedidasClient): nome (min 2), descrição (max 1000), checkboxes de tags, input preview `accept="image/*"`, input original `accept=".cdr,.svg,.pdf,.ai,.eps,.png,.jpg,.jpeg,.webp,.gif"` → `POST /api/admin/arts/upload` com FormData (`tagIds` como `JSON.stringify`) → sucesso: `router.refresh()` + fecha; erro: mensagem inline; loading no submit; valida client-side de arquivos obrigatórios
   - **Dialog "Editar"**: nome, descrição, tags → `PATCH /api/admin/arts/[id]` com `{ name, description (null se vazio), tagIds }` → `router.refresh()`
   - **Excluir**: `window.confirm()` → `DELETE /api/admin/arts/[id]` → `router.refresh()`
   - **Aba Tags (T1):** lista com contagem de artes por tag, input inline criar (`POST /api/admin/art-tags`, disabled se < 2 chars), renomear inline (`PATCH /api/admin/art-tags/[id]` com Check/X), excluir com confirm (`DELETE /api/admin/art-tags/[id]`, spinner durante) — todos com `router.refresh()`

### Decisões
- Filtro 100% client-side (volume baixo; server page já traz tudo) — conforme decisão do plano (linha 444)
- CSRF via Origin automática do browser em fetch same-origin não-GET — nenhum header custom (validado no todo 13)
- Reuso de `Dialog`/`DialogContent`/`DialogTitle` de `src/components/ui/dialog.tsx` (base-ui, controlado via `open`/`onOpenChange`) e `Button` de `src/components/ui/button.tsx`
- `<img>` para preview por exigência explícita do plano (rota autenticada não passa pelo otimizador)

## Verificações

### 1. TypeScript — `npx tsc --noEmit`
```
EXIT=0
```
Zero erros.

### 2. ESLint nos arquivos novos
```
npx eslint "src/app/(admin)/admin/conteudo/**/*.{ts,tsx}"
✖ 1 problem (0 errors, 1 warning)  @next/next/no-img-element (linha 436)
EXIT=0
```
O único warning é o `<img>` **exigido** pelo plano (proibido usar next/image na rota autenticada).

### 3. `npm run lint` (global) — pré-existente, fora do escopo
O lint global falha com **39 erros, todos em arquivos preexistentes e intocados** (verificado via `git status`: nenhum desses arquivos foi modificado):
- `src/app/(marketing)/[categoria]/page.tsx`, `empresarial/page.tsx` — react-hooks/error-boundaries
- `src/components/layout/Navbar.tsx`, `src/components/sections/HeroVideo.tsx` — react-hooks/set-state-in-effect
- `src/lib/rag/tools.ts` — no-explicit-any
- Warnings pré-existentes em chat-analytics/route.ts, FabiChatWidget.tsx, InstagramSection.tsx, AnimatedSection.tsx, ProductForm.tsx
- **Contribuição deste todo ao lint: apenas o warning intencional de `<img>` (0 erros)**

## Regras de negócio implementadas (acceptance criteria)
- [x] `npx tsc --noEmit` limpo (exit 0)
- [x] T2 não vê aba Tags (hidden em `role === "T2_VENDEDOR"`)
- [x] T2 não vê Editar/Excluir em artes de outros (`art.createdById === userId` é obrigatório para T2)
- [x] "Nova arte" e "Baixar" visíveis para T1 e T2
- [x] Upload com preview + original, tags opcionais
- [x] Busca e filtro de tags funcionam client-side
- [x] Sem paginação, sem `as any`/`@ts-ignore`, sem next/image na rota autenticada

## Arquivos não tocados (conforme MUST NOT)
- `src/app/(admin)/admin/(t1)/usuarios/` — intocado
- `chat/`, `WhatsAppFab.tsx`, `analytics.ts`, `chat-analytics/` — intocados
- Nenhum arquivo fora de `conteudo/` e da evidência foi modificado/commitado
