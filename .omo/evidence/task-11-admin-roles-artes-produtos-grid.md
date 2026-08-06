# Task 11 — Env vars + .env.example + README (setup Google Drive)

**Status:** ✅ Concluído
**Data:** 2026-08-06
**Commit:** `docs: document Google Drive setup for art storage`

## O que foi feito

### 1. `.env.example`
Bloco novo adicionado ao final do arquivo (formato idêntico aos blocos existentes):

```
# ── Google Drive (Artes) ────────────────────────────────
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
GOOGLE_DRIVE_ARTS_FOLDER_ID=1xxxxxxxxxxxxxxxxxxxxxxxx
```

Placeholders apenas — nenhum valor real.

### 2. `README.md`
Nova subseção `### Google Drive (Artes)` sob `## Variáveis de ambiente`, seguindo o estilo das demais (tabela `| Variável | Descrição |`), com os 5 passos do plano:
1. Criar projeto no Google Cloud;
2. Habilitar a Google Drive API;
3. Criar a conta de serviço e baixar a chave JSON (com aviso explícito: nunca commitar o arquivo);
4. Criar a pasta no Drive e compartilhar com o e-mail da conta de serviço (permissão Editor);
5. Definir `GOOGLE_SERVICE_ACCOUNT_JSON` (conteúdo JSON inteiro) e `GOOGLE_DRIVE_ARTS_FOLDER_ID` no Vercel / `.env.local`.

Nenhuma outra seção do README foi tocada.

## Verificações (QA)

### happy: `git diff -- .env.example README.md` mostra apenas as variáveis novas
```
diff --git a/.env.example b/.env.example          (4 linhas adicionadas — bloco Google Drive)
diff --git a/README.md b/README.md                (15 linhas adicionadas — seção Google Drive)
```
Nenhuma outra linha alterada nos dois arquivos.

### failure: grep por "BEGIN PRIVATE KEY" no repo → 0 resultados
Busca recursiva (PowerShell `Select-String -Recurse`, excluindo `.git`, `node_modules`, `.next`):

```
$matches = Get-ChildItem -Recurse -File -Force | Where-Object { $_.FullName -notmatch '\\.git\\|\\node_modules\\|\\.next\\' } | Select-String -Pattern "BEGIN PRIVATE KEY" -List
```

Resultado: **1 match em `.omo/plans/admin-roles-artes-produtos-grid.md` linha 379** — trata-se do texto do próprio plano (cenário de QA citando o padrão de busca), NÃO uma credencial. Nenhuma chave privada real (`.pem`/`.json` de service account) existe em arquivos versionáveis do repositório.

## Guardrails
- ✅ Nenhuma credencial real commitada (verificação acima).
- ✅ Outras seções do README intocadas (diff limitado a 2 arquivos + evidência).
- ✅ `.env.local` não alterado; nenhum `.env` novo criado.
- ✅ Commit inclui APENAS `.env.example`, `README.md` e esta evidência (mudanças não relacionadas no working tree — `WhatsAppFab.tsx`, `analytics.ts`, etc. — deixadas fora).
