# OG Images Dinâmicas por Rota

> **Status:** `pendente`
> **ID:** `2026-06-13-og-images-dinamicas`
> **Criada em:** 2026-06-13
> **Agente:** implementador

---

## Contexto

Atualmente todas as páginas usam a mesma OG image estática definida em `src/app/layout.tsx` (`/og-image.jpg`). Quando um cliente compartilha um link de categoria ("Uniformes de Futebol") ou de produto no WhatsApp, Instagram ou Telegram, a pré-visualização mostra a imagem genérica do site — não o produto em questão.

Para o público-alvo da Fase Sport (compradores de uniformes esportivos que chegam por indicação e redes sociais), compartilhar links de produtos com pré-visualização visual é um canal de conversão importante. OG images relevantes aumentam CTR e transmitem profissionalismo.

O Next.js 16 suporta geração de OG images via convenção de arquivo `opengraph-image.tsx` usando `ImageResponse` (`next/og`), sem dependências externas.

**Planejamento anterior:** listado como "pós-launch" no ADR-7 do planejamento de frontend. V1 concluída — momento certo para implementar.

---

## Objetivos

- [ ] Gerar OG image dinâmica por categoria com nome da modalidade e identidade visual Fase
- [ ] Gerar OG image dinâmica por produto com imagem principal do produto (se disponível) + nome
- [ ] Homepage mantém OG image estática já configurada (sem alteração)
- [ ] Imagens geradas em tempo de build para rotas estáticas (SSG), on-demand para rotas com dados dinâmicos

## Fora de escopo

- OG images para páginas do admin
- Twitter Card separada (a OG image já serve para Twitter/X por padrão)
- Geração de imagens com fontes customizadas (usar apenas system fonts para evitar complexidade de carregamento de fonte no edge)
- Internacionalização (apenas PT-BR)

---

## Abordagem Técnica

### Como funciona no Next.js 16

O arquivo `opengraph-image.tsx` no diretório de uma rota é automaticamente detectado e servido em `/[rota]/opengraph-image`. O metadata `openGraph.images` não precisa ser definido manualmente — o Next.js injeta automaticamente.

```
src/app/(marketing)/[categoria]/
  ├── page.tsx
  └── opengraph-image.tsx   ← nova, gera OG para /futebol, /volei, etc.

src/app/(marketing)/[categoria]/[produto]/
  ├── page.tsx
  └── opengraph-image.tsx   ← nova, gera OG para /futebol/modelo-x, etc.
```

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/(marketing)/[categoria]/opengraph-image.tsx` | criar | OG image da página de categoria |
| `src/app/(marketing)/[categoria]/[produto]/opengraph-image.tsx` | criar | OG image da página de produto |
| `src/app/(marketing)/[categoria]/page.tsx` | verificar | Confirmar que `generateMetadata` não define `openGraph.images` manualmente (conflitaria) |
| `src/app/(marketing)/[categoria]/[produto]/page.tsx` | verificar | Idem acima |

### Design das OG images

**Categoria** (1200×630px):
```
[Fundo escuro #111827]
[Barra lateral esquerda #CD3438 (brand), 8px]
[Logo "FASE SPORT" no topo esquerdo — texto branco, Barlow Condensed]
[Nome da categoria em destaque — ex: "FUTEBOL" — texto branco, 80px, uppercase]
[Subtítulo — "Uniformes Personalizados" — texto cinza claro, 32px]
[Badge "fasesport.com.br" no rodapé direito]
```

**Produto** (1200×630px):
```
Layout split: imagem do produto à direita (50%), texto à esquerda (50%)
[Esquerda — fundo #111827]
  [Logo "FASE SPORT" no topo]
  [Nome do produto — texto branco, 56px, max 2 linhas]
  [Nome da categoria — texto #CD3438, 28px]
  [Badge "fasesport.com.br" no rodapé]
[Direita — imagem principal do produto, object-cover]
[Se não houver imagem: fundo #CD3438 sólido com ícone de uniforme]
```

### Decisões técnicas (ADR)

**ADR-1 — `ImageResponse` de `next/og`, sem biblioteca externa.**
`next/og` usa Satori internamente (Edge Runtime compatible). Não requer Puppeteer nem servidor separado. Output é PNG.

**ADR-2 — System fonts apenas.**
Carregar fontes customizadas (Barlow Condensed) em `ImageResponse` requer fetch de arquivo `.ttf` em runtime — adiciona latência e complexidade. Usar `font-family: 'system-ui'` mantém a leitura limpa. Exceção: se a imagem estiver com `dynamic = 'force-static'`, pode-se carregar a fonte do filesystem em build time.

**ADR-3 — `generateStaticParams` reutilizado implicitamente.**
Como as rotas `[categoria]` e `[produto]` já têm `generateStaticParams` em `page.tsx`, o Next.js automaticamente gera os OG images em build time para todos os slugs estáticos. Não é necessário declarar `generateStaticParams` novamente em `opengraph-image.tsx` (mas é possível se quiser subconjunto diferente).

**ADR-4 — Imagem do produto via URL do R2, não `next/image`.**
`ImageResponse` não usa `<Image>` do Next.js. Usar `<img src={product.images[0].url}>` com `object-fit: cover`. A URL do R2 é pública e acessível.

---

## Checklist de Implementação

- [ ] 1. Criar `src/app/(marketing)/[categoria]/opengraph-image.tsx`:
  ```tsx
  import { ImageResponse } from 'next/og'
  import { prisma } from '@/lib/db'

  export const size = { width: 1200, height: 630 }
  export const contentType = 'image/png'

  export default async function Image({ params }: { params: Promise<{ categoria: string }> }) {
    const { categoria } = await params
    const category = await prisma.category.findUnique({
      where: { slug: categoria },
      select: { name: true },
    })

    return new ImageResponse(
      (
        <div style={{ /* layout descrito no design acima */ }}>
          {/* JSX com os elementos visuais */}
        </div>
      ),
      { ...size }
    )
  }
  ```
- [ ] 2. Criar `src/app/(marketing)/[categoria]/[produto]/opengraph-image.tsx` com layout split (imagem do produto à direita)
- [ ] 3. Buscar no Prisma a imagem primária do produto: `images: { where: { isPrimary: true }, take: 1 }`
- [ ] 4. Implementar fallback visual quando `product.images` estiver vazio (fundo #CD3438)
- [ ] 5. Verificar em `[categoria]/page.tsx` e `[produto]/page.tsx` se há `openGraph.images` definido manualmente em `generateMetadata` — remover se houver (conflito com arquivo de convenção)
- [ ] 6. Rodar `npm run build` e confirmar zero erros
- [ ] 7. Testar localmente: acessar `http://localhost:3000/futebol/opengraph-image` e confirmar que retorna PNG
- [ ] 8. Validar com [opengraph.xyz](https://opengraph.xyz) ou similar colando a URL da preview do Vercel

## Critérios de Aceitação

- [ ] `GET /futebol/opengraph-image` retorna PNG 1200×630 com o nome "FUTEBOL" visível
- [ ] `GET /futebol/modelo-champions/opengraph-image` retorna PNG com nome do produto e imagem (ou fallback vermelho se sem imagem)
- [ ] Compartilhar link de categoria no WhatsApp Web mostra a OG image correta (verificar via [cards-dev.twitter.com](https://cards-dev.twitter.com/validator) ou similar)
- [ ] `npm run build` passa sem erros
- [ ] `npm run type-check` limpo

---

## Notas

- Referência: [Next.js docs — opengraph-image](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)
- `ImageResponse` aceita JSX com CSS inline (subset CSS — sem `grid`, sem `border-radius` em alguns casos)
- Tamanho 1200×630 é o padrão do WhatsApp/Facebook/LinkedIn; Twitter/X aceita 1200×600 (próximo o suficiente)
- Verificar se `@vercel/og` ou `next/og` está instalado — Next.js 16 inclui nativamente via `next/og`
