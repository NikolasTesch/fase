# Homepage: Contato, Mapa e Hero com Imagem real

> **Status:** `pendente`
> **ID:** `2026-06-18-homepage-contato-mapa`
> **Criada em:** 2026-06-13
> **Agente:** arquiteto

---

## Contexto

Atualmente, a Homepage do catálogo público apresenta três gaps em relação aos requisitos do PRD e às especificações visuais:
1. **Hero sem imagem real:** O Hero atual usa apenas um gradiente CSS de cor sólida. Para um site comercial de uniformes esportivos, o PRD exige apelo visual forte e imagens reais dos uniformes personalizados.
2. **Seção de Contato ausente:** A Homepage termina no banner do CTA de Orçamento (`CtaBannerSection`), mas não exibe as informações de endereço, contatos da loja ou formulário de contato integrado conforme o previsto na tabela de seções do `spec.md` (§19.2).
3. **Embed do Google Maps ausente:** O projeto prevê a exibição da localização da loja em Colatina-ES via Google Maps, mas isso ainda não foi implementado.

Para mitigar esses gaps sem sobrecarregar a performance da página, usaremos otimizações nativas de imagem do Next.js e um mapa estático baseado em iframe (lazy load), preservando as métricas de LCP e CLS.

---

## Objetivos

- [ ] Integrar uma imagem real e chamativa de uniformes esportivos como fundo ou elemento de destaque no `HeroSection`.
- [ ] Otimizar a imagem do Hero usando `<Image>` do `next/image` com as propriedades `priority={true}` e `sizes` responsivas adequadas (evitando LCP tardio).
- [ ] Criar a seção de contato `ContactSection` contendo:
  - O formulário de orçamento multi-step (`<OrcamentoForm />`).
  - As informações institucionais de contato (endereço em Colatina-ES, e-mail, telefone).
  - Um mapa do Google Maps incorporado via `<iframe>` estático.
- [ ] Integrar a `ContactSection` na Homepage (`src/app/(marketing)/page.tsx`) posicionada entre as seções `WhySection` (Por que a Fase?) e `CtaBannerSection`.
- [ ] Garantir que o mapa por iframe se comporte de forma responsiva e use `loading="lazy"` para não bloquear o carregamento crítico.

## Fora de escopo

- Integração com a API Javascript de Mapas (usaremos apenas o embed via iframe para otimização de bundle e custos).
- Modificações adicionais no fluxo do `OrcamentoForm` (a lógica do form em si já está consolidada).
- Mudança nos contatos no CMS admin (as informações de contato são estáticas para a V1, obtidas de `SITE_CONTACT` em `src/lib/site.ts`).

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/components/sections/HeroSection.tsx` | modificar | Substituir o gradiente sólido por uma imagem de fundo real otimizada com overlay gradiente. |
| `src/components/sections/ContactSection.tsx` | criar | Criar a nova seção com formulário de contato, informações institucionais e o iframe do mapa. |
| `src/app/(marketing)/page.tsx` | modificar | Importar e renderizar `<ContactSection>` na homepage. |
| `public/images/hero-bg.jpg` | criar | Adicionar imagem mock do hero no diretório público local do projeto. |

### Decisões técnicas (ADR)

**ADR-4 (Refinada) — Mapa via iframe com fallback dinâmico:**
Se a variável de ambiente `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` estiver configurada, usaremos a API de Embed do Google Maps (`https://www.google.com/maps/embed/v1/place?key=...`). Se não estiver configurada (ou em ambiente de desenvolvimento local sem chaves), usaremos uma URL de busca pública estática (`https://www.google.com/maps/embed?pb=...`) apontando para Colatina-ES, garantindo que o mapa sempre renderize corretamente.

**ADR-6 (Refinada) — Otimização de LCP no Hero:**
A imagem do Hero é o maior elemento visual acima da dobra (above the fold). Portanto:
1. Usaremos `priority={true}` no componente `<Image />`.
2. Usaremos `sizes="100vw"` ou mais específicas dependendo da quebra de layout para permitir que o navegador baixe o tamanho correto de imagem.
3. Usaremos um overlay gradiente com opacidade para garantir contraste legível para o texto do cabeçalho.

---

### Estrutura do Iframe do Mapa em `ContactSection.tsx`
```tsx
const mapUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=Fase+Sport,Colatina+ES`
  : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29946.031575775836!2d-40.640698!3d-19.53818!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xb82bfb5463f253%3A0xe54e69b0fa69db43!2sColatina%20-%20ES!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr"; // Fallback para Colatina
```

---

## Checklist de Implementação

- [ ] 1. Obter e colocar a imagem `hero-bg.jpg` na pasta `public/images/`.
- [ ] 2. Modificar `src/components/sections/HeroSection.tsx` para importar `Image` do `next/image` e renderizá-la com `fill`, `priority={true}` e `className="object-cover -z-10 animate-fade-in"` junto com o overlay escurecido.
- [ ] 3. Criar o arquivo `src/components/sections/ContactSection.tsx` com o layout de duas colunas em desktop:
  - Coluna Esquerda: Informações institucionais (endereço, telefone, e-mail) + Iframe do mapa responsivo.
  - Coluna Direita: O formulário `<OrcamentoForm />` dentro de um card visual.
- [ ] 4. Atualizar `src/app/(marketing)/page.tsx` para renderizar `<ContactSection>` antes de `<CtaBannerSection>`.
- [ ] 5. Verificar a compatibilidade de estilos (Tailwind CSS 4) no layout responsivo da seção.
- [ ] 6. Rodar `npm run type-check` e `npm run lint` para garantir integridade do código.

## Critérios de Aceitação

- [ ] A Homepage exibe uma imagem real otimizada no Hero, e o texto principal continua perfeitamente legível.
- [ ] O componente `next/image` do Hero gera a tag `priority` (ou `preload`) no HTML.
- [ ] A Homepage possui uma nova seção de contato contendo o formulário multi-step de orçamento funcional.
- [ ] O mapa do Google Maps carrega corretamente em desktop e mobile (responsivo dentro de seu container).
- [ ] O iframe do mapa usa `loading="lazy"` para evitar bloqueio no carregamento inicial da página.
- [ ] Sem variável de API do Google Maps, o fallback do mapa aponta para Colatina-ES corretamente.
- [ ] Nenhum erro de compilação TypeScript ou ESLint.
