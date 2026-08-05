import { NextRequest } from "next/server";

/**
 * Valida o header Origin ou Referer para proteção CSRF.
 *
 * Permite requisições da própria aplicação comparando o host da requisição
 * com o Origin ou Referer enviado pelo navegador.
 */
export function validateCsrf(req: NextRequest): { valid: boolean; reason?: string } {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");
  const isDev = process.env.NODE_ENV === "development";

  // Se possui Origin (chamadas POST/PUT/PATCH/DELETE via browser)
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (host && originHost === host) {
        return { valid: true };
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (appUrl) {
        const appHost = new URL(appUrl).host;
        if (originHost === appHost) {
          return { valid: true };
        }
      }

      if (isDev) {
        return { valid: true };
      }

      return {
        valid: false,
        reason: `Origin "${origin}" não autorizado para o host "${host}"`,
      };
    } catch {
      return { valid: false, reason: "Origin inválido" };
    }
  }

  // Se possui Referer
  if (referer) {
    try {
      const refererHost = new URL(referer).host;
      if (host && refererHost === host) {
        return { valid: true };
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (appUrl) {
        const appHost = new URL(appUrl).host;
        if (refererHost === appHost) {
          return { valid: true };
        }
      }

      if (isDev) {
        return { valid: true };
      }

      return {
        valid: false,
        reason: `Referer "${referer}" não autorizado para o host "${host}"`,
      };
    } catch {
      return { valid: false, reason: "Referer inválido" };
    }
  }

  // Sem Origin e sem Referer
  if (isDev || process.env.VERCEL) {
    return { valid: true };
  }
  return { valid: false, reason: "Requisição sem Origin ou Referer" };
}
