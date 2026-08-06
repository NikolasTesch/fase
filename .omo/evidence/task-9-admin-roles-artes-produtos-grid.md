# Task 9 — Instalar googleapis + criar src/lib/drive.ts

**Plano:** `.omo/plans/admin-roles-artes-produtos-grid.md` (todo 9)
**Data:** 2026-08-06

## 1. `npm i googleapis`

```
added 48 packages, and audited 920 packages in 45s
14 vulnerabilities (1 low, 5 moderate, 8 high)
EXIT_CODE=0
```

- `googleapis` adicionada em `dependencies` do `package.json` (e `package-lock.json` atualizado).
- `sharp` já estava em `package.json` (usado em `src/app/api/admin/upload/route.ts`) — NÃO reinstalado (todo 13 usa, verificação fica lá).

## 2. `src/lib/drive.ts` (código exato do plano)

- `getCredentials()` lê `GOOGLE_SERVICE_ACCOUNT_JSON` e faz `JSON.parse` (sem `keyFile` — Vercel não tem arquivo).
- `getAuth()` → `new google.auth.GoogleAuth({ credentials, scopes: ["https://www.googleapis.com/auth/drive.file"] })` (escopo mínimo `drive.file`).
- `export const ARTS_FOLDER_ID = process.env.GOOGLE_DRIVE_ARTS_FOLDER_ID ?? ""`.
- `uploadArtFile(buffer, name, mimeType)` → `drive.files.create({ requestBody: { name, mimeType, parents: [ARTS_FOLDER_ID] }, media: { mimeType, body: buffer } })` → `res.data.id!`.
- `streamDriveFile(fileId)` → `drive.files.get({ fileId, alt: "media" }, { responseType: "stream" })` → `res.data as NodeJS.ReadableStream`.
- `deleteDriveFile(fileId)` → `drive.files.delete({ fileId })`.
- Sem cliente global (instanciado por chamada), sem credencial commitada.

## 3. `npx tsc --noEmit`

```
EXIT_CODE=0
```

## 4. Verificação de escopo

- `git diff` do commit contém APENAS: `package.json`, `package-lock.json`, `src/lib/drive.ts`, `.omo/evidence/task-9-admin-roles-artes-produtos-grid.md`.
- Nenhum arquivo fora do todo 9 foi tocado (mudanças pré-existentes em `WhatsAppFab.tsx`/`analytics.ts` não estagiadas).
- `grep` por `BEGIN PRIVATE KEY` no repo: 0 resultados (nenhuma credencial).

## Resultado: PASS
