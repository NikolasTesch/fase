import { NextRequest } from "next/server";

/**
 * Extrai o IP real do cliente com fallback seguro.
 *
 * Ordem de precedência:
 * 1. x-real-ip (setado por proxies confiáveis — Vercel, Nginx, etc.)
 * 2. x-vercel-forwarded-for (Vercel anexa o IP real do cliente neste header)
 * 3. x-forwarded-for (ÚLTIMO valor: o IP mais recente da cadeia, anexado pelo último
 *    proxy confiável — o primeiro valor é o IP original que o cliente pode forjar)
 * 4. "anonymous"
 */
export function getClientIp(req: NextRequest): string {
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;

  const vercelForwarded = req.headers.get("x-vercel-forwarded-for");
  if (vercelForwarded) return vercelForwarded;

  // x-forwarded-for pode ter múltiplos IPs (client, proxy1, proxy2) — o último é o
  // que o último proxy confiável anexou; os anteriores são forjáveis pelo cliente
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((ip) => ip.trim()).filter(Boolean);
    if (ips.length > 0) return ips[ips.length - 1];
  }

  return "anonymous";
}
