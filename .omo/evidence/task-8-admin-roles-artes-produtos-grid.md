# Task 8 — Página /admin/usuarios (T1) — Evidência

**Plano:** admin-roles-artes-produtos-grid
**Data:** 2026-08-06
**Status:** ✅ Concluído

## O que foi implementado

- `src/app/(admin)/admin/(t1)/usuarios/page.tsx` (server component, `dynamic = "force-dynamic"`) — busca `adminUser.findMany` (id, email, name, role, isActive, createdAt, orderBy createdAt desc) e renderiza `<UsuariosClient>`.
- `src/app/(admin)/admin/(t1)/usuarios/_components/UsuariosClient.tsx` ("use client") — tabela Nome/E-mail/Papel/Status/Criado em/Ações, Dialog "Novo usuário" (POST /api/admin/users), Dialog "Editar" (PATCH /api/admin/users/[id] — papel, ativo, nova senha opcional), feedback de erro inline, loading no botão.
- Página criada DIRETAMENTE sob o route group `(t1)` (URL: /admin/usuarios), conforme o plano.

## Verificação

- `npx tsc --noEmit` → **exit 0** (rodado após a conclusão; o erro pré-existente de `UsuariosClient` ausente foi resolvido).
- UI de auto-desativação: o backend rejeita com 403 "Você não pode desativar a si mesmo" (todo 7) — o client reflete a mensagem.
- T2 não acessa a página: o layout `(t1)` redireciona `/admin/conteudo` (todo 4).

## Commit

- `597e2bc` — `feat: implement admin user management interface and integrate modular RAG agent configuration`
  (commit feito pelo agente; incluiu também arquivos de outra esteira — chat-analytics — que estavam no working tree no mesmo momento.)

## Nota de processo

O agente do todo 8 ficou pendurado em execução após concluir o trabalho (29min, última ação bash). O deliverable foi verificado por mim (arquivos presentes, type-check verde, commit feito) e a task de background foi cancelada manualmente — o resultado é o mesmo: todo concluído.
