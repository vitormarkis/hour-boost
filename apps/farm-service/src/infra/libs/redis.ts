import Redis from "ioredis"

const tls = process.env.REDIS_UPSTASH_TLS

console.log(`[Redis] Connecting to ${tls ? "production" : "local"} Redis.`)
export const redis = tls ? new Redis(tls) : new Redis()
