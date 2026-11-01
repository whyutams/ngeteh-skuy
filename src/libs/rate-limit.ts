import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Penyimpanan cadangan di memori jika Upstash belum dikonfigurasi
const inMemoryStore = new Map<string, { count: number; expiresAt: number }>();

function checkInMemoryRateLimit(identifier: string, limit: number, windowMs: number) {
  const now = Date.now();
  const record = inMemoryStore.get(identifier);

  if (!record || now > record.expiresAt) {
    inMemoryStore.set(identifier, { count: 1, expiresAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count };
}

// Inisialisasi rate limiter login (5 percobaan per 1 menit)
export async function checkRateLimit(identifier: string) {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken && !redisUrl.includes("your-upstash")) {
    try {
      const redis = new Redis({
        url: redisUrl,
        token: redisToken,
      });

      const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "60 s"),
        analytics: true,
        prefix: "ratelimit:login",
      });

      const result = await ratelimit.limit(identifier);
      return { success: result.success, remaining: result.remaining };
    } catch {
      // Fallback ke in-memory jika koneksi Upstash mengalami kendala
      return checkInMemoryRateLimit(identifier, 5, 60 * 1000);
    }
  }

  return checkInMemoryRateLimit(identifier, 5, 60 * 1000);
}

