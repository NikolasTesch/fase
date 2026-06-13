import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  analytics: false,
});

export const loginRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "15 m"),
  analytics: false,
  prefix: "ratelimit:login",
});
