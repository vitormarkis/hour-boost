import Redis from "ioredis"
import { env } from "~/env"

const tls = process.env.REDIS_UPSTASH_TLS

if (env.isInProduction()) console.log(`[Redis] Connecting to ${tls ? "production" : "local"} Redis.`)
export const redis = tls ? new Redis(tls) : new Redis()
