export const JWT_SECRET_FALLBACK = "fasesport_jwt_secret_default_2026";

export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || JWT_SECRET_FALLBACK;
  return new TextEncoder().encode(secret);
}
