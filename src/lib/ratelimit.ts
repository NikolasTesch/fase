import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasRedisEnv =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

const redis = hasRedisEnv ? Redis.fromEnv() : null;

function createLimiter(
  limiter: ReturnType<typeof Ratelimit.slidingWindow>,
  prefix?: string
) {
  if (!redis) {
    // fail-closed: sem Redis configurado, nenhuma requisição passa sem erro explícito
    return {
      limit: async () => {
        throw new Error("UPSTASH_REDIS_REST_URL/TOKEN não configurados");
      },
    };
  }

  return new Ratelimit({
    redis,
    limiter,
    analytics: false,
    ...(prefix ? { prefix } : {}),
  });
}

/** Rate limit para o formulário de contato público: 5 req / 10 min */
export const ratelimit = createLimiter(Ratelimit.slidingWindow(5, "10 m"));

/** Rate limit para login admin: 10 req / 15 min */
export const loginRatelimit = createLimiter(
  Ratelimit.slidingWindow(10, "15 m"),
  "ratelimit:login"
);

/** Rate limit para operações CRUD admin: 60 req / 1 min */
export const adminRatelimit = createLimiter(
  Ratelimit.slidingWindow(60, "1 m"),
  "ratelimit:admin"
);

/** Rate limit para upload de arquivos: 10 req / 1 min */
export const uploadRatelimit = createLimiter(
  Ratelimit.slidingWindow(10, "1 m"),
  "ratelimit:upload"
);
