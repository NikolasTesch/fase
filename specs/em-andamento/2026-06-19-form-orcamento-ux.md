# UX Form Orçamento — Máscara, A11y, Step Indicator, Focus Management

> **Status:** `pendente`
> **ID:** `2026-06-19-form-orcamento-ux`
> **Criada em:** 2026-06-12
> **Revisada em:** 2026-06-13
> **Agente:** arquiteto

---

## Contexto

O formulário multi-step de orçamento (`OrcamentoForm.tsx`) tem quatro problemas de UX/acessibilidade:

1. **Sem máscara de telefone** — usuário digita sem formato; validação falha por discrepância de expectativa.
2. **Inputs sem estado visual de erro** — erros mostram texto abaixo mas o input não muda visualmente (sem `border-destructive`, sem `aria-invalid`, sem `aria-describedby`).
3. **Step indicator com 2 estados, não 3** — `i <= step` trata step concluído e step atual identicamente. Padrão profissional: concluído (checkmark), ativo (ring vazio), futuro (opaco).
4. **Foco não movido ao avançar steps** — após `setStep`, foco permanece no botão "Próximo". Usuários de teclado e leitores de tela não percebem a mudança de conteúdo.

**Depende de:** `2026-06-18-analytics-eventos` para o evento `lead_submit` em `onSubmit`. Pode ser implementada em paralelo se `trackEvent` ainda não existir — adicionar o call quando analytics estiver pronto.

## Objetivos

- [ ] Máscara progressiva de telefone brasileiro (formato `(XX) XXXXX-XXXX`)
- [ ] Todos os inputs com erro: `border-destructive` + `aria-invalid="true"` + `aria-describedby`
- [ ] Mensagens de erro com `id` + `role="alert"`
- [ ] Step indicator com 3 estados visuais distintos: concluído / ativo / futuro
- [ ] Ao avançar step, foco movido para heading do novo step

## Fora de escopo

- Substituição da biblioteca de forms (manter React Hook Form)
- Máscaras em outros campos além de telefone
- Animação de transição entre steps (pós-launch)
- Validação de telefone via API externa

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/components/forms/OrcamentoForm.tsx` | modificar | Máscara, estados visuais, step indicator, focus management |
| `src/lib/validations/contact.ts` | modificar | Ajustar validação de `phone` para aceitar valor com máscara |

### Máscara de telefone — implementação progressiva (slice-by-slice)

**Não usar regex com grupos opcionais** — falha em inputs parcialmente preenchidos.

```ts
function maskPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
```

**Integração com React Hook Form — padrão correto:**

`register("phone")` injeta um `onChange` próprio. Sobrescrever via spread silenciosamente quebra a validação. Usar destructuring:

```tsx
const { onChange: _rhfOnChange, ...phoneReg } = register('phone')

<input
  {...phoneReg}
  type="tel"
  onChange={(e) => {
    const masked = maskPhone(e.target.value)
    setValue('phone', masked, { shouldValidate: true })
  }}
/>
```

`shouldValidate: true` garante que a validação do RHF continua sendo acionada a cada tecla.

**Atualizar `ContactSchema` em `contact.ts`:**

Strippear não-dígitos antes de validar comprimento, e aceitar tanto `(XX) XXXXX-XXXX` quanto dígitos puros:

```ts
phone: z.string()
  .transform(v => v.replace(/\D/g, ''))
  .refine(v => v.length >= 10 && v.length <= 11, {
    message: 'Telefone deve ter 10 ou 11 dígitos',
  }),
```

> Atenção: `z.string().transform()` muda o tipo de `ContactInput` — o valor que chega na API já será só dígitos, o que é desejável para armazenar no banco.

### Estado visual de erro nos inputs

Cada `<input>` / `<select>` / `<textarea>` deve receber:

```tsx
className={cn(
  "w-full rounded-md border px-3 py-2 text-sm ...",
  errors.fieldName ? "border-destructive" : "border-border"
)}
aria-invalid={errors.fieldName ? "true" : undefined}
aria-describedby={errors.fieldName ? "fieldName-error" : undefined}
```

Cada `<p>` de erro deve ter:

```tsx
<p id="fieldName-error" role="alert" className="text-destructive text-xs mt-1">
  {errors.fieldName.message}
</p>
```

Aplicar em todos os campos dos 3 steps: `sport`, `quantity`, `details`, `name`, `email`, `phone`, `city`.

### Step indicator — 3 estados visuais distintos

| Estado | Condição | Visual |
|---|---|---|
| Concluído | `i < step` | `bg-primary text-primary-foreground` + `<CheckIcon size={12}>` |
| Ativo | `i === step` | `bg-background ring-2 ring-primary text-primary` + número — anel vazado indica "estou aqui" |
| Futuro | `i > step` | `bg-muted text-muted-foreground opacity-50` + número |

Usar `aria-current="step"` no item ativo da `<ol>`.

> Concluído e ativo têm fundos opostos (preenchido vs vazado) — distinção clara sem depender só de cor.

### Focus management

Um único `ref` funciona porque os steps são renderizados condicionalmente — apenas o step ativo existe no DOM.

```tsx
const stepHeadingRef = useRef<HTMLHeadingElement>(null)

useEffect(() => {
  stepHeadingRef.current?.focus()
}, [step])
```

Cada bloco de step recebe:

```tsx
<h2 className="text-lg font-semibold mb-4" tabIndex={-1} ref={stepHeadingRef}>
  {STEPS[step]}
</h2>
```

`tabIndex={-1}` permite foco programático em elementos não-interativos sem incluí-los no tab order natural.

---

## Checklist de Implementação

- [ ] 1. Implementar `maskPhone()` (slice-by-slice) em `OrcamentoForm.tsx`
- [ ] 2. Aplicar máscara no input de telefone usando destructuring de `register` + `setValue` com `shouldValidate: true`
- [ ] 3. Atualizar `ContactSchema` em `contact.ts`: `phone` com `.transform()` + `.refine()` para strip de máscara
- [ ] 4. Adicionar `border-destructive`, `aria-invalid`, `aria-describedby` em todos os campos dos 3 steps
- [ ] 5. Adicionar `id="campo-error"` e `role="alert"` em todas as mensagens de erro
- [ ] 6. Refatorar step indicator para 3 estados (concluído/ativo/futuro) com `CheckIcon`
- [ ] 7. Adicionar `aria-current="step"` no item ativo da `<ol>`
- [ ] 8. Implementar focus management com `useRef` + `useEffect([step])`
- [ ] 9. Adicionar `<h2 tabIndex={-1} ref={stepHeadingRef}>` em cada step
- [ ] 10. Verificar `tsc --noEmit` limpo

## Critérios de Aceitação

- [ ] Digitar `(11) 91234-5678`: máscara aplica progressivamente a cada dígito
- [ ] Digitar `1` → exibe `(1`, digitar `11` → exibe `(11`, digitar `119` → exibe `(11) 9` — sem quebras intermediárias
- [ ] Campo com erro: borda vermelha + `aria-invalid="true"` no DOM + mensagem com `role="alert"`
- [ ] Step indicator: step 0 concluído mostra checkmark com fundo preenchido; step 1 ativo mostra número com ring vazio; step 2 futuro opaco
- [ ] Clicar "Próximo" e verificar via DevTools que foco está no `<h2>` do próximo step
- [ ] Navegar pelo formulário inteiro só com Tab/Enter/Shift+Tab sem perda de contexto
- [ ] Schema Zod: telefone com máscara `(11) 91234-5678` é válido; `123` é inválido

---

## Notas

- `CheckIcon` de `lucide-react` (já instalado via shadcn/ui).
- WCAG 2.1 coberto: 1.3.1 (info e relacionamentos), 3.3.1 (identificação de erro), 3.3.2 (labels), 2.4.3 (focus order), 4.1.3 (mensagens de status).
- O `z.string().transform()` no schema faz `ContactInput["phone"]` continuar `string`, mas `ContactOutput["phone"]` também é `string` (só dígitos). Isso é intencional — a API recebe o número limpo.
- Se `trackEvent('lead_submit')` ainda não existir quando esta spec for implementada, deixar um `// TODO: trackEvent('lead_submit', { sport, source })` no `onSubmit` e concluir quando a spec de analytics estiver pronta.
