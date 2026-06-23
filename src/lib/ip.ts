import { NextRequest } from "next/server";

/**
 * Extrai o IP real do cliente com fallback seguro.
 *
 * Ordem de precedência:
 * 1. x-real-ip (setado por proxies confiáveis — Vercel, Nginx, etc.)
 * 2. x-forwarded-for (primeiro IP da lista, após split)
 * 3. x-forwarded-for (raw, sem split)
 * 4. IP direto da conexão (req.ip)
 * 5. "anonymous"
 */
export function getClientIp(req: NextRequest): string {
  // Vercel e proxies confiáveis setam x-real-ip
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;

  // x-forwarded-for pode ter múltiplos IPs (proxy1, proxy2, client)
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((ip) => ip.trim()).filter(Boolean);
    if (ips.length > 0) return ips[0];
  }

  return "anonymous";
}
