# Busca de Produtos

> **Status:** `pendente`
> **ID:** `2026-06-21-busca-produtos`
> **Criada em:** 2026-06-13
> **Agente:** arquiteto

---

## Contexto

A medida que o catálogo de uniformes esportivos cresce, fica mais difícil para o cliente encontrar um modelo específico folheando apenas as categorias. O PRD (§4.1) classifica a funcionalidade de busca de produtos como de severidade média, mas importante para a experiência do usuário final (UX).

Esta especificação aborda a criação de um endpoint de busca no Prisma, uma página dedicada de resultados de busca (`/busca?q=termo`) e a integração de um campo de busca na `Navbar`.

---

## Objetivos

- [ ] Estender o endpoint `/api/products` (e consultas diretas via Prisma) para suportar o parâmetro de query `q` filtrando por nome e descrição do produto (case-insensitive).
- [ ] Criar a página de resultados `/busca/page.tsx` (Server Component) que:
  - Lê o parâmetro `q` da URL (ex: `/busca?q=Champions`).
  - Busca os produtos correspondentes no banco de dados.
  - Renderiza o grid de produtos (`<ProductGrid />`) com o título: "Resultados para: 'termo'".
  - Exibe um empty state amigável se nenhum produto corresponder, oferecendo um botão para limpar a busca ou preencher o formulário de orçamento.
- [ ] Adicionar um campo de busca responsivo na `Navbar`:
  - Desktop: Campo de input expansível ou com ícone de lupa.
  - Mobile: Ícone de busca que revela o input ou redireciona diretamente.
  - Ao pressionar `Enter` ou clicar no ícone, redireciona o usuário para `/busca?q=termo_digitado`.

## Fora de escopo

- Autocompletar dinâmico (search-as-you-type/typeahead) via AJAX no cabeçalho (visando simplicidade inicial e otimização de banda na V1). A busca será submetida via Enter/Submit.
- Filtros avançados na página de busca (como filtros por tamanho ou faixa de preço - o catálogo é sob consulta).
- Histórico de buscas salvas no navegador.

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/api/products/route.ts` | modificar | Adicionar filtro opcional `OR: [{ name: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }]` se `q` estiver presente na query string. |
| `src/app/(marketing)/busca/page.tsx` | criar | Nova página pública para exibir os resultados da busca baseada em query params. |
| `src/components/layout/Navbar.tsx` | modificar | Integrar o input de busca com controle de estado local e ação de submissão/redirecionamento. |

### Decisões técnicas (ADR)

**Mapeamento de Rotas Estáticas vs Dinâmicas no Next.js:**
A rota `/busca` é estática e não conflita com a rota dinâmica de categorias `/[categoria]`. O Next.js prioriza automaticamente caminhos estáticos específicos antes de tentar resolver rotas dinâmicas com parâmetros.

**Desempenho da consulta no Prisma:**
Usaremos a cláusula `mode: 'insensitive'` nas pesquisas textuais para garantir compatibilidade e indexabilidade básica de strings sem precisar de infraestrutura complexa de busca (como Elasticsearch ou Postgres Full Text Search), que estão fora de escopo para o volume esperado na V1.

---

## Checklist de Implementação

- [ ] 1. Modificar o arquivo `src/app/api/products/route.ts` para ler a query string `q` e aplicar a lógica do Prisma:
  ```typescript
  // Exemplo de cláusula where
  const q = searchParams.get("q");
  const where = {
    isActive: true,
    ...(q ? {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } }
      ]
    } : {})
  };
  ```
- [ ] 2. Criar a página de busca em `src/app/(marketing)/busca/page.tsx` que:
  - Recupera `q` de `searchParams` (lembrando que `searchParams` é `Promise` no Next.js 16).
  - Executa a busca no Prisma incluindo a imagem primária dos produtos.
  - Renderiza o grid de produtos e o breadcrumb correspondente.
- [ ] 3. Criar e estilizar o campo de input de busca na `Navbar.tsx` com Tailwind:
  - Estado controlado local para guardar o termo digitado.
  - Submissão via formulário básico (`<form onSubmit={handleSearch}>`) para escutar o teclado (Enter) nativamente.
- [ ] 4. Testar buscas vazias, buscas com múltiplos termos e caracteres especiais.
- [ ] 5. Rodar `npm run type-check` e `npm run lint`.

## Critérios de Aceitação

- [ ] Digitar "Champions" no campo da Navbar e pressionar Enter redireciona para `/busca?q=Champions` e renderiza os produtos que tenham esse termo no nome ou na descrição.
- [ ] Uma busca que não retorna resultados exibe a mensagem: "Nenhum modelo encontrado para 'termo'" e oferece um link de "Voltar ao catálogo" e outro para o formulário de orçamento.
- [ ] O input de busca na Navbar é responsivo e amigável em telas pequenas.
- [ ] A API `/api/products?q=Champions` retorna os mesmos resultados filtrados em formato JSON.
- [ ] Desempenho e compatibilidade estrita com TypeScript e ESLint mantidos.
