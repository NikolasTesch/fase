# Marketing: Reformulação dos Heros das Páginas de Categoria

> **Status:** `pendente`
> **ID:** `2026-06-13-hero-categorias`
> **Criada em:** 2026-06-13
> **Agente:** arquiteto

---

## Contexto

As páginas internas de categoria (como Futebol, Vôlei e Basquete) utilizam atualmente um componente `CategoryHero.tsx` simplificado, com altura modesta (`py-12 lg:py-16`) e que recorre a um gradiente simples de cor primária caso não haja imagem cadastrada no banco.

Para elevar o apelo visual e unificar a experiência premium da marca Fase Sport, reestruturaremos os Heros de todas as categorias para exibir um cabeçalho **alto e imersivo (Large Hero)**. Ele contará com uma imagem de alta definição preenchendo todo o plano de fundo, sobreposta por uma camada degradê de **vermelho escuro** e o texto de destaque posicionado no lado esquerdo. Também geraremos imagens conceituais específicas para o fundo de cada modalidade esportiva.

---

## Objetivos

- [ ] Aumentar a escala física do `CategoryHero.tsx` para se tornar um "Large Hero" (ex: preenchimento vertical de `py-24 lg:py-36` ou altura mínima de `min-h-[400px]` com alinhamento flex).
- [ ] Aplicar uma camada de sobreposição com gradiente de vermelho escuro (vermelho marca sombreado) da esquerda para a direita (`from-red-950/95 via-red-950/75 to-transparent`), garantindo contraste excelente para a leitura do texto sobreposto.
- [ ] Posicionar o texto de destaque (Nome da categoria e descrição) estritamente no lado esquerdo do Hero, garantindo um visual equilibrado e alinhado aos padrões modernos de design.
- [ ] Mapear e carregar imagens especiais para o fundo de cada uma das 8 categorias ativas da loja:
  - Futebol (`futebol-hero.jpg`)
  - Vôlei (`volei-hero.jpg`)
  - Basquete (`basquete-hero.jpg`)
  - Handebol (`handebol-hero.jpg`)
  - Passeio (`passeio-hero.jpg`)
  - Agasalho (`agasalho-hero.jpg`)
  - Colete (`colete-hero.jpg`)
  - Acessórios (`acessorios-hero.jpg`)
- [ ] Configurar um fallback no backend/frontend para buscar a imagem local da pasta `/images/categories/[slug]-hero.jpg` caso o campo `imageUrl` no banco esteja nulo ou vazio, garantindo que todas as categorias exibam a nova imagem imediatamente.

---

## Fora de escopo

- Upload dessas imagens de fundo de categoria via painel CMS na V1 (permanecerão como assets estáticos no frontend para otimização de performance e facilidade de carregamento via `next/image`).

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/components/sections/CategoryHero.tsx` | modificar | Aumentar o tamanho do hero, alterar o gradiente para vermelho escuro e garantir que os textos fiquem à esquerda sobrepostos na imagem. |
| `src/app/(marketing)/[categoria]/page.tsx` | modificar | Resolver a URL da imagem de fundo: verificar `category.imageUrl` do banco de dados e, se vazio, apontar para `/images/categories/${category.slug}-hero.jpg`. |
| `public/images/categories/` | criar | Pasta para hospedar as 8 novas imagens conceituais de fundo de cada esporte. |

### Visual Layout (Tailwind CSS)

O novo design de `CategoryHero.tsx` será estruturado da seguinte forma:

```tsx
export function CategoryHero({ name, description, imageUrl }: CategoryHeroProps) {
  return (
    <section className="relative isolate min-h-[380px] lg:min-h-[450px] flex items-center overflow-hidden rounded-3xl bg-red-950 text-white shadow-xl">
      {/* Imagem de Fundo Completa */}
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={name}
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
      )}
      
      {/* Overlay Degradê Vermelho Escuro */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-red-950 via-red-950/80 to-red-900/20 lg:from-red-950 lg:via-red-950/85 lg:to-transparent"
        aria-hidden="true"
      />

      {/* Conteúdo à Esquerda */}
      <div className="w-full max-w-3xl px-6 py-16 lg:px-12 lg:py-24">
        <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl leading-none text-white font-extrabold uppercase tracking-tight">
          {name}
        </h1>
        {description && (
          <p className="mt-4 max-w-xl text-lg md:text-xl text-zinc-100/90 font-medium leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
```

---

## Decisões técnicas (ADR)

**ADR-21 — Camada Gradiente Direcional da Esquerda para a Direita:**
Para garantir acessibilidade (WCAG AA) com contraste de texto sobre imagem (que normalmente gera baixa legibilidade), usaremos um gradiente linear horizontal opaco no início (`from-red-950` com opacidade total no ponto do texto) que desvanece suavemente em direção à direita, permitindo que a imagem de fundo apareça claramente na metade direita da tela.

**ADR-22 — Carregamento Priority no LCP:**
A imagem do CategoryHero é o elemento de maior impacto visual na dobra inicial (LCP - Largest Contentful Paint) das páginas de categoria. Portanto, o componente `<Image>` correspondente continuará com `priority` ativo para ser pré-carregado pelo navegador imediatamente.

---

## Checklist de Implementação

- [ ] 1. Criar a pasta `public/images/categories/` caso ela não exista.
- [ ] 2. Gerar as 8 imagens conceituais de fundo (`futebol-hero.jpg`, `volei-hero.jpg`, etc.) representando atletas em ação, detalhes de tecidos ou partidas reais, focando em texturas esportivas dinâmicas e de alta qualidade.
- [ ] 3. Refatorar o componente `CategoryHero.tsx` com as novas classes de tamanho, overlay vermelho escuro e alinhamento à esquerda.
- [ ] 4. Atualizar a lógica em `src/app/(marketing)/[categoria]/page.tsx` para carregar a imagem correspondente da pasta local se o campo `imageUrl` estiver nulo no banco.
- [ ] 5. Testar a responsividade e o contraste em dispositivos móveis, garantindo que o gradiente se estenda e escureça a imagem para manter o texto 100% legível.
- [ ] 6. Rodar o build de produção (`npm run build`) para validação final.

---

## Critérios de Aceitação

- [ ] Todas as páginas de categoria renderizam um Hero em tela cheia com altura mínima de 380px no mobile e 450px no desktop.
- [ ] A imagem correspondente preenche todo o fundo do Hero sem distorção.
- [ ] A sobreposição de vermelho escuro garante leitura limpa dos textos brancos posicionados à esquerda.
- [ ] Caso a categoria não possua imagem no banco, o fallback local da pasta `public/images/categories/` é carregado automaticamente.
- [ ] O projeto compila com sucesso no build estático.
