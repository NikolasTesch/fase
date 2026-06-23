import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

/** Rate limit para o formulário de contato público: 5 req / 10 min */
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  analytics: false,
});

/** Rate limit para login admin: 10 req / 15 min */
export const loginRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "15 m"),
  analytics: false,
  prefix: "ratelimit:login",
});

/** Rate limit para operações CRUD admin: 60 req / 1 min */
export const adminRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: false,
  prefix: "ratelimit:admin",
});

/** Rate limit para upload de arquivos: 10 req / 1 min */
export const uploadRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: false,
  prefix: "ratelimit:upload",
});
