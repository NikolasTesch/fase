# Alinhamento ao Design System — Correções em Código Existente

> **Status:** `pendente`
> **ID:** `2026-06-12-ds-alignment`
> **Criada em:** 2026-06-12
> **Agente:** arquiteto (auditoria de 47 arquivos em `src/`)

---

## Contexto

O design system da Fase Sport foi definido em `globals.css` (tokens brand, fontes Inter + Barlow Condensed), mas a implementação existente não o aplica corretamente. A auditoria identificou violações de tipografia, cores hardcoded fora dos tokens, uso incorreto de componentes e dois bugs de segurança que bloqueiam o deploy.

## Objetivos

- [ ] Corrigir as 2 vulnerabilidades de segurança (SEC-1, SEC-2)
- [ ] Remover todos os pesos de fonte hardcoded em headings (DS-FONT-1)
- [ ] Substituir cores hardcoded por tokens do design system (DS-COLOR-1, DS-COLOR-2)
- [ ] Padronizar uso de `<Button>` e ícones lucide-react (DS-COMP-1, DS-COMP-2)
- [ ] Adicionar token `--destructive-foreground` ausente em `globals.css`
- [ ] Corrigir 3 bugs de lógica/validação no backend (CODE-1 a CODE-3)

## Fora de escopo

- Criação de componentes novos (Navbar, Footer, sections, ProductCard) — serão specs separadas
- Reescrita da `page.tsx` (homepage) — spec separada
- Implementação do endpoint `DELETE /api/admin/products/[id]/images/[imageId]` (CODE-4) — spec separada por ser feature nova

---

## Abordagem Técnica

Todas as mudanças são cirúrgicas dentro de arquivos existentes. Nenhuma mudança de arquitetura.

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/globals.css` | modificar | Adicionar token `--destructive-foreground` |
| `src/lib/resend.ts` | modificar | Escapar HTML antes de interpolar campos no e-mail |
| `src/app/api/upload/route.ts` | mover | Para `src/app/api/admin/upload/route.ts` |
| `src/app/api/contact/route.ts` | modificar | Corrigir parsing de `x-forwarded-for` |
| `src/app/api/admin/leads/route.ts` | modificar | Validar enum `LeadStatus` antes do cast |
| `src/app/api/admin/auth/login/route.ts` | modificar | Adicionar rate limiting (10 req / 15 min) |
| `src/app/(marketing)/orcamento/page.tsx` | modificar | Remover `font-bold`, aumentar h1 para `text-5xl` |
| `src/app/(admin)/dashboard/page.tsx` | modificar | Remover `font-semibold` do h1 |
| `src/app/(admin)/produtos/page.tsx` | modificar | Remover `font-semibold`, badge "Ativo" com tokens brand, `<Button asChild>` |
| `src/app/(admin)/categorias/page.tsx` | modificar | Remover `font-semibold` do h1 |
| `src/app/(admin)/depoimentos/page.tsx` | modificar | Remover `font-semibold`, `<Button asChild>` |
| `src/app/(admin)/leads/page.tsx` | modificar | Remover `font-semibold`, ícone `<X>` |
| `src/app/(admin)/login/page.tsx` | modificar | Remover `font-semibold` do h1 |
| `src/components/forms/OrcamentoForm.tsx` | modificar | Remover `font-semibold` do h2 |
| `src/app/(admin)/produtos/_components/ProductForm.tsx` | modificar | `text-destructive-foreground`, ícone `<X>`, `next/image` para URLs R2 |

### Decisões técnicas (ADR)

**Escape de HTML no e-mail:** implementar função utilitária `escapeHtml()` local em `resend.ts` em vez de importar biblioteca — o escopo é pequeno (5 campos) e não justifica dependência externa.

**Rate limit no login:** usar a instância `ratelimit` já criada em `src/lib/ratelimit.ts` com uma chave prefixada (`login:{ip}`) em vez de criar nova instância — mantém um único cliente Redis.

**Mover rota de upload:** a única referência ao path `/api/upload` está em `ProductForm.tsx`. Atualizar o `fetch` lá ao mesmo tempo que o arquivo é movido.

---

## Checklist de Implementação

### Segurança
- [ ] 1. Adicionar `escapeHtml()` em `src/lib/resend.ts` e aplicar em todos os campos interpolados
- [ ] 2. Mover `src/app/api/upload/route.ts` → `src/app/api/admin/upload/route.ts`
- [ ] 3. Atualizar `fetch("/api/upload")` em `ProductForm.tsx` para `/api/admin/upload`
- [ ] 4. Adicionar rate limit no `POST /api/admin/auth/login`

### globals.css
- [ ] 5. Adicionar `--destructive-foreground` em três lugares:
  - `@theme inline` → `--color-destructive-foreground: var(--destructive-foreground);` (após a linha `--color-destructive`)
  - `:root` → `--destructive-foreground: oklch(0.985 0 0);` (após a linha `--destructive`)
  - `.dark` → `--destructive-foreground: oklch(0.985 0 0);` (após a linha `--destructive`)

### Tipografia (remover pesos hardcoded)
- [ ] 6. `orcamento/page.tsx:14` — `text-3xl font-bold` → `text-5xl`
- [ ] 7. `dashboard/page.tsx:22` — remover `font-semibold`
- [ ] 8. `produtos/page.tsx:19` — remover `font-semibold`
- [ ] 9. `categorias/page.tsx:15` — remover `font-semibold`
- [ ] 10. `depoimentos/page.tsx:16` — remover `font-semibold`
- [ ] 11. `leads/page.tsx:61` — remover `font-semibold`
- [ ] 12. `login/page.tsx:44` — remover `font-semibold`
- [ ] 13. `OrcamentoForm.tsx:82` — remover `font-semibold`

### Cores
- [ ] 14. `produtos/page.tsx:48` — badge "Ativo": `bg-green-100 text-green-700` → `bg-brand-tint text-brand-dark`
- [ ] 15. `ProductForm.tsx:282` — `text-white` → `text-destructive-foreground`

### Componentes
- [ ] 16. `produtos/page.tsx:20-25` — `<Link className="...bg-primary...">` → `<Button asChild><Link>`
- [ ] 17. `depoimentos/page.tsx:17-22` — mesmo padrão
- [ ] 18. `ProductForm.tsx:284` — `×` literal → `<X size={14} />` do lucide-react
- [ ] 19. `leads/page.tsx:128` — `×` literal → `<X size={16} />` do lucide-react
- [ ] 20. `ProductForm.tsx:273-274` — `<img>` para URLs R2 → `next/image` com `fill` + `sizes="120px"`

### Backend
- [ ] 21. `contact/route.ts:9` — `x-forwarded-for` → `.split(",")[0].trim()`
- [ ] 22. `admin/leads/route.ts:7` — validar enum `LeadStatus` antes do cast

## Critérios de Aceitação

- [ ] Nenhum arquivo em `src/` usa `bg-green-*`, `text-green-*`, `text-white` em contextos de UI
- [ ] Nenhum heading (`h1`-`h6`) usa `font-bold` ou `font-semibold` diretamente (peso vem do `@layer base`)
- [ ] `POST /api/upload` (sem prefixo `/admin`) retorna 404
- [ ] `POST /api/admin/upload` com cookie de admin válido retorna 200
- [ ] O e-mail de lead não renderiza HTML injetado em campos de texto
- [ ] `GET /api/admin/leads?status=INVALIDO` retorna 400, não 500
- [ ] `npx tsc --noEmit` sem erros nos arquivos modificados

---

## Notas

- A rota `/admin/depoimentos/novo` e `/admin/depoimentos/[id]` são referenciadas em `depoimentos/page.tsx` mas não existem em `src/`. Isso causa 404 ao clicar. Está fora do escopo desta spec (seria nova tela), mas o implementador deve comentar o link ou substituir por `#` como placeholder temporário.
- `CODE-4` (remover imagem de produto não persiste) foi movido para spec separada por exigir criação de novo endpoint.
