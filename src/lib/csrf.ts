import { NextRequest } from "next/server";

/**
 * Valida o header Origin ou Referer para proteção CSRF.
 *
 * Em produção, rejeita requisições sem Origin/Referer ou com origem diferente
 * do domínio da aplicação. Em desenvolvimento permite requisições sem Origin
 * (ex.: Postman, curl) mas valida se presente.
 */
export function validateCsrf(req: NextRequest): { valid: boolean; reason?: string } {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Extrai o origin permitido do APP_URL
  let allowedOrigin: string;
  try {
    allowedOrigin = new URL(appUrl).origin;
  } catch {
    allowedOrigin = "http://localhost:3000";
  }

  // Em desenvolvimento, permite chamadas sem Origin/Referer (curl, Postman, etc.)
  const isDev = process.env.NODE_ENV === "development";

  // Se tem Origin, valida
  if (origin) {
    try {
      const originParsed = new URL(origin).origin;
      if (originParsed !== allowedOrigin) {
        return {
          valid: false,
          reason: `Origin "${origin}" não permitido`,
        };
      }
      return { valid: true };
    } catch {
      return { valid: false, reason: "Origin inválido" };
    }
  }

  // Se não tem Origin mas tem Referer, valida pelo Referer
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (refererOrigin !== allowedOrigin) {
        return {
          valid: false,
          reason: `Referer "${referer}" não permitido`,
        };
      }
      return { valid: true };
    } catch {
      return { valid: false, reason: "Referer inválido" };
    }
  }

  // Sem Origin e sem Referer
  if (isDev) {
    return { valid: true }; // permite em dev
  }
  return { valid: false, reason: "Requisição sem Origin ou Referer" };
}
