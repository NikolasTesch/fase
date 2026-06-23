import { ZodError } from "zod";

/**
 * Retorna apenas as mensagens de erro amigáveis, sem vazar a estrutura do schema.
 *
 * Uso:
 *   if (!validated.success) {
 *     return formatZodError(validated.error)
 *   }
 */
export function formatZodError(error: ZodError) {
  const messages = error.issues.map((issue) => {
    const path = issue.path.join(".");
    if (issue.message === "Required") {
      return `O campo ${path} é obrigatório`;
    }
    return issue.message;
  });

  return Response.json(
    { success: false, message: messages.join("; ") },
    { status: 400 }
  );
}

/**
 * Wrapper para respostas de erro padronizadas.
 */
export function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, message }, { status });
}
