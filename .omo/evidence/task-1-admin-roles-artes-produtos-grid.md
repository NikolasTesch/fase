# Task 1 — AdminRole/ArtTag/ArtFile no schema Prisma + db push

**Plano:** `.omo/plans/admin-roles-artes-produtos-grid.md` (todo 1)
**Data:** 2026-08-06
**Resultado:** ✅ PASS

## Alterações em `prisma/schema.prisma`

### 1. `enum AdminRole` (adicionado antes de `model AdminUser`)

```prisma
enum AdminRole {
  T1_GERENCIA
  T2_VENDEDOR
}
```

### 2. `model AdminUser` (campos adicionados, nada removido)

```prisma
model AdminUser {
  id           String      @id @default(cuid())
  email        String      @unique
  passwordHash String
  name         String
  role         AdminRole   @default(T1_GERENCIA)
  isActive     Boolean     @default(true)
  artsCreated  ArtFile[]
  createdAt    DateTime    @default(now())
}
```

- `updatedAt` **NÃO** foi adicionado (tabela já tem linhas; db push falharia em NOT NULL sem default).
- Defaults `T1_GERENCIA` / `true` garantem backfill das linhas existentes.

### 3. `model ArtTag` e `model ArtFile` (adicionados no final do arquivo)

```prisma
model ArtTag {
  id   String    @id @default(cuid())
  name String    @unique
  slug String    @unique
  arts ArtFile[]
}

model ArtFile {
  id               String    @id @default(cuid())
  name             String
  description      String?
  previewFileId    String    // Drive file id da imagem de preview
  previewMimeType  String
  originalFileId   String    // Drive file id do arquivo original (.cdr/.svg/.pdf)
  originalFileName String    // ex.: "escudo-corinthians.cdr"
  originalMimeType String
  sizeBytes        Int?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  createdBy        AdminUser? @relation(fields: [createdById], references: [id], onDelete: SetNull)
  createdById      String?
  tags             ArtTag[]
}
```

- `isActive` **NÃO** foi incluído em `ArtFile` (exclusão é hard delete no todo 13 — campo seria morto).
- Nenhum outro model foi alterado. Nenhuma relação `ArtFile↔Category`. Nome `ArtFile`/`ArtTag` (não `Art`, que colide com lib do Next).

## Execução dos comandos (saída real)

### `npx prisma db push` — exit code 0

```
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
Datasource "db": PostgreSQL database "neondb", schema "public" at "ep-broad-bonus-ac5blz61-pooler.sa-east-1.aws.neon.tech"

Your database is now in sync with your Prisma schema. Done in 2.30s

EXIT_CODE=0
```

### `npx prisma generate` — exit code 0

```
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
┌─────────────────────────────────────────────────────────┐
│  Update available 7.8.0 -> 7.9.1                        │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘

✔ Generated Prisma Client (v7.8.0) to .\node_modules\@prisma\client in 365ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)


EXIT_CODE=0
```

### `npx tsc --noEmit` — exit code 0

```
EXIT_CODE=0
```

## Confirmação de exposição no client gerado

`grep AdminRole|ArtTag|ArtFile` em `node_modules/.prisma/client/` → 5 arquivos, incluindo `index.d.ts`, `index.js`, `schema.prisma` do client. `@prisma/client` expõe `AdminRole`, `ArtTag` e `ArtFile`.

## Acceptance criteria do plano

| Critério | Status |
|---|---|
| `npx prisma generate` passa | ✅ exit 0 |
| `npx tsc --noEmit` passa | ✅ exit 0 |
| `npx prisma db push` aplica sem erro | ✅ exit 0 |
| `@prisma/client` expõe `AdminRole`, `ArtTag`, `ArtFile` | ✅ confirmado no client gerado |

## Commit

`feat(admin): add AdminRole and art models to Prisma schema` — apenas `prisma/schema.prisma` + esta evidência.
