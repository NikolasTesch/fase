# Todo 17 — Seed: vendedor demo T2 + tags iniciais

**Plano:** `.omo/plans/admin-roles-artes-produtos-grid.md` todo 17 (itens a–c).
**Data:** 2026-08-06
**Commit:** `feat(seed): seed seller role and initial art tags`

## O que foi feito

Em `prisma/seed.ts`, logo após o bloco de upsert do admin existente (linhas 21–26, **não alterado**), foram adicionados dois blocos:

1. **Vendedor (T2)** — lê `SELLER_SEED_EMAIL`/`SELLER_SEED_PASSWORD`; se ambos presentes, faz `upsert` com `role: "T2_VENDEDOR"` e `isActive: true` (hash bcrypt cost 12, reusando o `import bcrypt from "bcryptjs"` já existente no arquivo); se ausentes, **pula com aviso sem falhar**.
2. **Tags de arte** — 9 tags iniciais (`Escudo, Mascote, Patrocinador, Futebol, Vôlei, Basquete, Handebol, Número, Time`) com slug normalizado:
   `name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")`, upsert por slug (idempotente).

Não foram criadas artes demo (exigiria credenciais do Drive). Nenhuma variável foi adicionada ao `.env`.

## Execução 1 — sem env do vendedor (deve pular, não falhar)

```bash
npx prisma db seed
```

Saída real (trecho relevante):

```
✓ Admin: admin@fasesport.com
⚠ Vendedor (T2): SELLER_SEED_EMAIL/SELLER_SEED_PASSWORD ausentes — pulando
✓ 9 tags de arte
✓ Categoria: Futebol (4 produtos)
...
✅ Seed concluído com sucesso!

The seed command has been executed.
```

Exit code: 0. (Aviso de SSL do `pg` é pré-existente do driver, não do seed.)

## Execução 2 — com env inline do vendedor (happy path)

```powershell
$env:SELLER_SEED_EMAIL="vendedor.demo@fasesport.com"; $env:SELLER_SEED_PASSWORD="Vendedor#2026"; npx prisma db seed
```

Saída real (trecho relevante):

```
✓ Admin: admin@fasesport.com
✓ Vendedor (T2): vendedor.demo@fasesport.com
✓ 9 tags de arte
...
✅ Seed concluído com sucesso!
```

## Verificação no banco (query via Prisma)

Após a execução 2:

```
SELLER: {"email":"vendedor.demo@fasesport.com","role":"T2_VENDEDOR","isActive":true}
TAG_COUNT: 9
TAGS: Basquete=basquete, Escudo=escudo, Futebol=futebol, Handebol=handebol, Mascote=mascote, Número=numero, Patrocinador=patrocinador, Time=time, Vôlei=volei
```

Slugs corretos, incluindo normalização de acentos: `Número → numero`, `Vôlei → volei`, `Patrocinador → patrocinador`.

## Cleanup

O vendedor de teste (`vendedor.demo@fasesport.com`, criado apenas para validar o happy path) foi removido do banco após a verificação — o estado final é idêntico ao de um seed sem env:

```
DELETED_TEST_SELLER: 1
ADMINS: [{"email":"admin@fasesport.com","role":"T1_GERENCIA"}]
```

## Arquivos alterados

- `prisma/seed.ts` (blocos novos após o admin, admin intacto)
- `.omo/evidence/task-17-admin-roles-artes-produtos-grid.md` (este arquivo)

## Resultado

✅ Todos os critérios de aceite atendidos:
- `npx prisma db seed` roda sem erro com e sem env do vendedor.
- Vendedor demo criado com role `T2_VENDEDOR` e `isActive: true` quando env presente.
- 9 tags criadas com slug correto (ex.: `patrocinador`).
