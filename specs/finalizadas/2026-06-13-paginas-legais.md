# Páginas Legais — Política de Privacidade e Termos de Uso

> **Status:** `pendente`
> **ID:** `2026-06-13-paginas-legais`
> **Criada em:** 2026-06-13
> **Agente:** implementador

---

## Contexto

O site coleta dados pessoais de duas formas: (1) o formulário de orçamento (`POST /api/contact`) salva nome, e-mail, telefone e cidade no banco; (2) o Google Analytics 4 rastreia comportamento de navegação. Ambos são processamentos de dados pessoais sujeitos à LGPD (Lei 13.709/2018).

O `ConsentBanner.tsx` já existe e controla o carregamento do GA4 com base no consentimento do usuário, mas o banner atualmente não linka para uma política de privacidade — o que é requisito legal para que o consentimento seja válido. Sem a página de privacidade, o consentimento registrado é juridicamente inválido.

O planejamento de frontend (`specs/planejamento-frontend-fase2.md`, item 5 — Riscos) listou explicitamente: *"política de privacidade redigida? Necessária antes de GA4 em produção"*.

**Impacto de não fazer:** risco legal (LGPD), consentimento inválido, possível remoção do site de índices de busca que sinalizam falta de página de privacidade.

---

## Objetivos

- [ ] Criar página `/privacidade` com política de privacidade completa da Fase Sport
- [ ] Criar página `/termos` com termos de uso simplificados
- [ ] Atualizar `ConsentBanner.tsx` para linkar para `/privacidade`
- [ ] Atualizar o `Footer.tsx` para incluir links "Privacidade" e "Termos"
- [ ] Adicionar rotas ao `sitemap.ts` com prioridade baixa

## Fora de escopo

- Política de cookies separada (coberta pelo consentimento no banner e pela política de privacidade)
- Gestão de solicitações de titulares (acesso, exclusão de dados) — manual na V1
- DPO (Data Protection Officer) — não obrigatório para pequenas empresas na V1
- Tradução para inglês

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/(marketing)/privacidade/page.tsx` | criar | Página de política de privacidade |
| `src/app/(marketing)/termos/page.tsx` | criar | Página de termos de uso |
| `src/components/analytics/ConsentBanner.tsx` | modificar | Adicionar link `/privacidade` no texto do banner |
| `src/components/layout/Footer.tsx` | modificar | Adicionar links "Privacidade" e "Termos" na seção legal do footer |
| `src/app/sitemap.ts` | modificar | Incluir `/privacidade` e `/termos` com `priority: 0.3` |

### Estrutura do conteúdo

**`/privacidade` — Política de Privacidade:**
```
1. Quem somos
   Fase Sport Artigos Esportivos — CNPJ [a preencher], Colatina-ES

2. Quais dados coletamos
   a) Via formulário de orçamento: nome, e-mail, telefone, cidade, modalidade, quantidade, detalhes
   b) Via cookies/analytics (somente com consentimento): dados de navegação, device, geolocalização aproximada

3. Por que coletamos
   a) Para responder solicitações de orçamento e contato comercial (legítimo interesse / execução de contrato)
   b) Para medir o desempenho do site e melhorar a experiência (interesse legítimo — somente com consentimento)

4. Com quem compartilhamos
   - Google LLC (Google Analytics 4) — somente com consentimento
   - Resend Inc. (envio de e-mail transacional)
   - Neon Inc. (banco de dados em nuvem, AWS us-east-1)
   Não vendemos dados a terceiros.

5. Por quanto tempo guardamos
   Leads/contatos: 2 anos após o último contato. Dados de analytics: conforme política do Google (14 meses padrão GA4).

6. Seus direitos (LGPD)
   Confirmação de tratamento, acesso, correção, portabilidade, eliminação, revogação de consentimento.
   Contato: [email a preencher]

7. Cookies
   Cookie de sessão admin (httpOnly, 7 dias). Cookie de consentimento (localStorage). Cookies de analytics GA4 (somente com consentimento).

8. Contato
   Fase Sport — [endereço], Colatina-ES. E-mail: [email]
```

**`/termos` — Termos de Uso:**
```
1. Aceitação
2. Uso do site (apenas navegação e contato comercial, sem e-commerce)
3. Propriedade intelectual (fotos e modelos são de propriedade da Fase Sport)
4. Limitação de responsabilidade (informações do catálogo são ilustrativas; preços sob consulta)
5. Lei aplicável (Brasil / Espírito Santo)
```

### Decisões técnicas (ADR)

**ADR-1 — Server Components estáticos, sem dados do banco.**
Conteúdo legal é texto estático — sem Prisma, sem fetch. `generateMetadata` estático.

**ADR-2 — Conteúdo como constantes TypeScript, não MDX.**
Usar componentes React simples com `<section>`, `<h2>`, `<p>`. Evita adicionar dependência de MDX para 2 páginas. O conteúdo pode ser atualizado diretamente no arquivo `.tsx`.

**ADR-3 — Design minimalista usando classes Tailwind existentes.**
Prose tipográfico simples com `max-w-3xl mx-auto` e hierarquia clara. Reutilizar `Breadcrumb` e `RevealOnScroll` existentes.

---

## Checklist de Implementação

- [ ] 1. Criar `src/app/(marketing)/privacidade/page.tsx`:
  - `generateMetadata` com title "Política de Privacidade — Fase Sport" e `robots: { index: false }`
  - Conteúdo nas seções listadas acima
  - Breadcrumb: Home → Privacidade
  - Data de última atualização no topo (hardcoded, ex: "Atualizado em junho de 2026")
- [ ] 2. Criar `src/app/(marketing)/termos/page.tsx`:
  - `generateMetadata` com title "Termos de Uso — Fase Sport" e `robots: { index: false }`
  - Conteúdo nas seções listadas acima
  - Breadcrumb: Home → Termos de Uso
- [ ] 3. Modificar `src/components/analytics/ConsentBanner.tsx`:
  - Localizar o texto do banner (algo como "Usamos cookies...")
  - Adicionar link: `<Link href="/privacidade">Política de Privacidade</Link>` no texto
- [ ] 4. Modificar `src/components/layout/Footer.tsx`:
  - Adicionar seção "Legal" ou linha de rodapé com:
    `© 2026 Fase Sport · <Link href="/privacidade">Privacidade</Link> · <Link href="/termos">Termos</Link>`
- [ ] 5. Modificar `src/app/sitemap.ts`:
  - Adicionar entradas para `/privacidade` e `/termos` com `priority: 0.3`, `changeFrequency: 'yearly'`
- [ ] 6. Rodar `npm run type-check` e `npm run lint`

## Critérios de Aceitação

- [ ] `GET /privacidade` retorna 200 com conteúdo das 8 seções da política
- [ ] `GET /termos` retorna 200 com conteúdo das 5 seções dos termos
- [ ] O `ConsentBanner` exibe link clicável para `/privacidade`
- [ ] O Footer contém links "Privacidade" e "Termos" clicáveis
- [ ] `sitemap.xml` inclui as duas URLs
- [ ] Páginas têm `robots: index: false` (páginas legais não precisam de SEO orgânico)

---

## Notas

- Os textos gerados aqui são **rascunhos técnicos** — devem ser revisados por alguém da Fase Sport antes do deploy em produção. Especialmente: CNPJ, e-mail de contato, endereço completo, nome do responsável pelo tratamento de dados.
- Referência LGPD: Art. 9º (direitos do titular) e Art. 8º (consentimento) da Lei 13.709/2018
- `robots: { index: false }` é convenção para páginas legais — evita que apareçam em buscas orgânicas
- O campo `[CNPJ]`, `[email]` e `[endereço]` devem ser preenchidos antes do lançamento
