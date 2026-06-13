# Página de Orçamento — Revisão e Completude

> **Status:** `pendente`
> **ID:** `2026-06-15-pagina-orcamento`
> **Criada em:** 2026-06-12
> **Agente:** arquiteto

---

## Contexto

`/orcamento` e o `OrcamentoForm` multi-step já existem e funcionam (3 steps, `POST /api/contact`, feedback inline). Faltam: pré-preenchimento por query params (vindo da página de produto), enriquecimento da tela de sucesso e alinhamento ao design system. É o destino do Fluxo B (PRD §5.5) e do CTA secundário da página de produto.

## Objetivos

- [ ] Consumir `?produto=` e `?sport=` em `/orcamento` e repassar ao `OrcamentoForm` via `defaultProductSlug`/`defaultSport`
- [ ] Confirmar que o form cobre os 3 steps do spec.md §16.2 (Modalidade → Personalização → Contato)
- [ ] Enriquecer a tela de sucesso com CTAs (voltar à home + abrir WhatsApp)
- [ ] Remover pesos de fonte hardcoded (alinhamento ao DS — pode sobrepor `2026-06-12-ds-alignment`)

## Fora de escopo

- Alterar o contrato de `POST /api/contact` (já implementado e correto)
- Mudar a validação `ContactSchema`
- Criar `layout.tsx` próprio para `/orcamento` (desnecessário — casca vem de `(marketing)/layout.tsx`)

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/(marketing)/orcamento/page.tsx` | modificar | Tipar e `await searchParams` (Promise no Next 16); validar `sport` contra enum; passar `defaultSport`/`defaultProductSlug` ao form; remover `font-bold` do h1, usar `text-5xl` |
| `src/components/forms/OrcamentoForm.tsx` | modificar | Remover `font-semibold` do h2; enriquecer bloco de sucesso com link home + `buildWhatsAppUrl()` |
| `src/lib/validations/contact.ts` | revisar (sem modificar) | Confirmar que o enum `sport` cobre os 8 valores; confirmar `source` com `.default('form')` |

### Decisões técnicas (ADR)

**Sem `layout.tsx` próprio para `/orcamento`.** A casca (Navbar/Footer/WhatsAppFab) já vem de `(marketing)/layout.tsx`. Um layout extra só agregaria aninhamento sem ganho.

**Confirmação inline, não rota separada.** O `OrcamentoForm` já exibe bloco de sucesso na mesma navegação. Manter inline preserva o estado e mantém o teste E2E (spec.md §16.2 verifica texto de sucesso na mesma página).

**Validar `sport` da query no servidor.** `searchParams.sport` é string arbitrária vinda da URL. Validar contra o enum de `ContactSchema` antes de passar como `defaultSport`; valor inválido → `undefined`. `produto` vira `defaultProductSlug` sem validação de existência (campo opcional no schema).

**`searchParams` é `Promise` no Next 16.** Tipar como `Promise<{ sport?: string; produto?: string }>` e `await` antes de ler.

---

## Checklist de Implementação

- [ ] 1. Em `orcamento/page.tsx`: tipar `searchParams` como `Promise<{ sport?: string; produto?: string }>` e `await`
- [ ] 2. Validar `sport` contra o array de valores do enum `ContactSchema` (futebol, volei, basquete, handebol, passeio, agasalho, colete, acessorios); inválido → `undefined`
- [ ] 3. Passar `defaultSport={sport}` e `defaultProductSlug={produto}` ao `<OrcamentoForm>`
- [ ] 4. Ajustar h1 da page: remover `font-bold`, manter `text-5xl` (peso vem do `@layer base`)
- [ ] 5. Em `OrcamentoForm`: remover `font-semibold` do h2 de step; adicionar no bloco de sucesso: `<Link href="/">Voltar à home</Link>` + `<a href={buildWhatsAppUrl()}>Falar no WhatsApp</a>`
- [ ] 6. Verificar que os 3 steps e a ordem de validação por step estão corretos (Modalidade → Personalização → Contato)

## Critérios de Aceitação

- [ ] `/orcamento?sport=futebol&produto=modelo-x` deixa "Futebol" pré-selecionado no Step 1
- [ ] `/orcamento?sport=invalido` não quebra; nenhuma modalidade pré-selecionada
- [ ] `productSlug` é enviado no payload do `POST /api/contact` quando veio via query
- [ ] Após envio bem-sucedido, bloco de sucesso exibe CTA de home e CTA de WhatsApp
- [ ] h1 e h2 não usam `font-bold`/`font-semibold` (peso herdado do design system)
- [ ] Teste E2E do Fluxo B (spec.md §16.2) continua passando
- [ ] `npx tsc --noEmit` sem erros

---

## Notas

- `OrcamentoForm` já aceita `defaultSport`/`defaultProductSlug` via props — a mudança é só popular a partir da query na page.
- Itens 4 e 5 se sobrepõem à spec `2026-06-12-ds-alignment`. Se aquela já foi implementada, apenas confirmar e não desfazer.
- `buildWhatsAppUrl` vem de `src/lib/site.ts` (spec `2026-06-13-layout-publico`); garantir que está disponível antes de implementar este passo.
