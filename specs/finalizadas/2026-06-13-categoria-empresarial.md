# Marketing/Navegacao: Categoria Especial "Empresarial" no Menu de Navegação

> **Status:** `pendente`
> **ID:** `2026-06-13-categoria-empresarial`
> **Criada em:** 2026-06-13
> **Agente:** arquiteto

---

## Contexto

O menu de navegação da Fase Sport (`Navbar.tsx` e `MobileMenu.tsx`) exibe atualmente apenas modalidades de vestuário essencialmente esportivo (Futebol, Vôlei, Basquete, etc.).

Para capturar e direcionar com eficácia o público corporativo (B2B) que busca uniformização profissional para empresas e equipes de trabalho, criaremos uma **categoria especial e exclusiva da barra de navegação** chamada **"Empresarial"**. Esta categoria atuará como um hub agrupador de segmentos profissionais específicos (como camisas sociais administrativas, polos profissionais, uniformes operacionais para oficinas e camisetas promocionais).

---

## Objetivos

- [ ] Cadastrar no banco de dados a categoria `Empresarial` (slug: `empresarial`) com as respectivas subcategorias de segmento profissional:
  - **Administrativo / Social (slug: `social`):** Camisas sociais de botão, alfaiataria corporativa.
  - **Polo Profissional (slug: `polo`):** Camisas polo corporativas com bordado ou silk.
  - **Operacional / Oficinas (slug: `operacional`):** Jalecos, Brim pesado, calças com faixas refletivas.
  - **Eventos / Promocional (slug: `promocional`):** Camisetas promocionais dry-fit ou algodão para campanhas.
- [ ] Alimentar o banco (via script de Seed) com produtos de demonstração para a linha empresarial em cada uma dessas subcategorias.
- [ ] Implementar o menu dropdown no cabeçalho desktop (`Navbar.tsx`):
  - Adicionar o item "Empresarial" em destaque no menu.
  - Ao passar o mouse (hover), abrir um menu suspenso (dropdown) estilizado exibindo os 4 segmentos corporativos.
  - Cada segmento apontará para a URL parametrizada (ex: `/empresarial?sub=social`, `/empresarial?sub=polo`).
- [ ] Implementar a navegação de forma responsiva no menu de celular (`MobileMenu.tsx`):
  - Exibir a categoria "Empresarial" no menu móvel.
  - Ao clicar, expandir (efeito colapso) para revelar os 4 links internos recuados à esquerda.

---

## Fora de escopo

- Criação de tabelas adicionais no banco. A categoria "Empresarial" existirá no mesmo modelo `Category` e `Subcategory` do Prisma, aproveitando o roteamento dinâmico `/src/app/(marketing)/[categoria]/page.tsx` existente, que já possui filtros de subcategoria embutidos.

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `prisma/seed.ts` | modificar | Adicionar o cadastro da categoria "Empresarial" com suas subcategorias e produtos promocionais/operacionais na rotina de seed. |
| `src/lib/site.ts` | modificar | Criar e exportar o objeto `CORPORATE_NAV` estruturando o menu B2B. |
| `src/components/layout/Navbar.tsx` | modificar | Integrar a renderização do menu dropdown desktop para "Empresarial". |
| `src/components/layout/MobileMenu.tsx` | modificar | Integrar suporte à navegação multinível (colapsável) para o menu mobile. |

### Configuração de Navegação B2B

No arquivo `src/lib/site.ts`, organizaremos as duas estruturas separadamente:

```typescript
export interface CorporateSubNavItem {
  slug: string;
  label: string;
}

export const CORPORATE_NAV = {
  label: "Empresarial",
  slug: "empresarial",
  subcategories: [
    { slug: "social", label: "Administrativo / Social" },
    { slug: "polo", label: "Polo Profissional" },
    { slug: "operacional", label: "Operacional / Oficinas" },
    { slug: "promocional", label: "Eventos / Promocional" }
  ] as CorporateSubNavItem[]
};
```

### Dropdown Desktop (Tailwind CSS)

O dropdown no desktop será construído utilizando posicionamento absoluto com classes de hover nativas e transição suave, ou via componentes de menu acessíveis do `@base-ui/react` (já instalados):

```tsx
<div className="group relative">
  <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
    Empresarial
    <ChevronDown className="size-4 text-muted-foreground transition-transform group-hover:rotate-180" />
  </button>
  
  <div className="absolute left-0 top-full z-50 mt-1 hidden w-56 rounded-xl border border-border bg-background p-2 shadow-lg group-hover:block animate-in fade-in slide-in-from-top-1 duration-150">
    {CORPORATE_NAV.subcategories.map((sub) => (
      <Link
        key={sub.slug}
        href={`/empresarial?sub=${sub.slug}`}
        className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        {sub.label}
      </Link>
    ))}
  </div>
</div>
```

---

## Decisões técnicas (ADR)

**ADR-25 — Reutilização do Core de Filtros Dinâmicos:**
Em vez de programarmos uma página inteiramente nova para `/empresarial`, utilizaremos a página genérica de categoria `[categoria]/page.tsx` alimentada pelo banco Neon. A navegação do menu e dropdown aponta diretamente para o slug `/empresarial` com a query string `?sub=[slug]`, fazendo com que o componente de filtro de subcategorias ative o filtro correto em tempo de renderização.

**ADR-26 — Menu Mobile Acordeão:**
Para evitar que o menu móvel ocupe toda a tela ao exibir os links corporativos, utilizaremos um estado boolean local (`isCorporateOpen`) que oculta/mostra a lista de sub-links com animação suave de altura do Framer Motion.

---

## Checklist de Implementação

- [ ] 1. Atualizar o `prisma/seed.ts` para criar a categoria `empresarial` e suas 4 subcategorias (`social`, `polo`, `operacional`, `promocional`), adicionando produtos como "Camisa Social Administrativa", "Camisa Polo Brim Profissional", etc.
- [ ] 2. Executar o seed local para preencher o banco:
  ```powershell
  npx prisma db seed
  ```
- [ ] 3. Adicionar a definição de `CORPORATE_NAV` em `src/lib/site.ts`.
- [ ] 4. Refatorar o componente `Navbar.tsx` para renderizar os links esportivos padrão e o novo dropdown "Empresarial".
- [ ] 5. Refatorar o componente `MobileMenu.tsx` para apresentar a seção "Empresarial" de forma expansível com um clique lateral de seta.
- [ ] 6. Realizar testes manuais de roteamento, validando se os cliques nos sub-links levam para a página de categorias filtrando as subcategorias correspondentes.
- [ ] 7. Executar a homologação do build com `npm run build`.

---

## Critérios de Aceitação

- [ ] O menu desktop apresenta a categoria "Empresarial" com uma seta indicadora de dropdown.
- [ ] Passar o mouse (hover) sobre o menu "Empresarial" abre o dropdown contendo os 4 links profissionais de forma instantânea e legível.
- [ ] Clicar em qualquer segmento empresarial no menu móvel ou desktop redireciona com sucesso para a página de catálogo `/empresarial` com a categoria pré-filtrada.
- [ ] O menu mobile exibe "Empresarial" de forma colapsável, abrindo as 4 opções recuadas sem sobrepor outros elementos.
- [ ] O projeto compila com sucesso.
