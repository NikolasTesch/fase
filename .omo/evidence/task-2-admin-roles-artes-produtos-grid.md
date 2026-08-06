# Evidência — Todo 2: Login admin: payload com role/isActive + rejeita inativo

## O que foi feito

Em `src/app/api/admin/auth/login/route.ts`:

1. **Rejeição de usuário inativo** — logo após o bloco `if (!user || !(await bcrypt.compare(...)))` (que retorna 401 "Credenciais inválidas"), adicionado:

   ```ts
   if (!user.isActive) {
     return Response.json({ message: "Usuário inativo. Fale com o administrador." }, { status: 401 });
   }
   ```

2. **Payload do SignJWT** trocado para incluir `role` e `isActive`:

   ```ts
   const token = await new SignJWT({ sub: user.id, email: user.email, role: user.role, isActive: user.isActive })
     .setProtectedHeader({ alg: "HS256" })
     .setExpirationTime("7d")
     .sign(getJwtSecret());
   ```

   `getJwtSecret()` mantido (sem fallback inline). Expiração (7d), nome do cookie (`admin_token`), flags (`HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`) e `LoginSchema` inalterados.

3. **Resposta de sucesso** agora expõe o papel para o cliente redirecionar:

   ```ts
   const response = Response.json({ success: true, role: user.role });
   ```

## Verificação executada

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | Exit 0 — sem erros de tipo |

## QA (cenários)

- **happy:** POST `/api/admin/auth/login` com credenciais válidas → `{ success: true, role }` + cookie setado. Verificado por inspeção do código (payload contém `role`/`isActive` tipados via Prisma, todo 1 já aplicado).
- **failure (runtime):** usuário com `isActive=false` → 401 `"Usuário inativo. Fale com o administrador."`. Caminho verificado por leitura: o check é executado antes de assinar o token; requer servidor + banco para teste E2E completo (não executado nesta evidência).

## Arquivos alterados

- `src/app/api/admin/auth/login/route.ts` (único arquivo de código deste todo)

## Commit

`feat(admin): add role and isActive claims to login`
