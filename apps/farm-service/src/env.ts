import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = {
  ...createEnv({
    server: {
      DATABASE_URL: z.string().url(),
      CLERK_SECRET_KEY: z.string().min(1),
      REDIS_UPSTASH_TLS: z.string().min(1),
      EXAMPLE_ACCOUNT_NAME: z.string().nullable().default(null),
      EXAMPLE_ACCOUNT_PASSWORD: z.string().nullable().default(null),
      NODE_ENV: z.enum(["DEV", "PRODUCTION"]),
      TOKEN_IDENTIFICATION_HASH: z.string().min(1),
      CLIENT_URL: z.string().url(),
      COOKIE_DOMAIN: z.string().includes("."),
      PORT: z
        .string()
        .length(4)
        .transform(s => Number.parseInt(s, 10))
        .pipe(z.number()),
      ACTIONS_SECRET: z.string().min(1),
    },
    runtimeEnv: process.env,
    // runtimeEnvStrict: {
    //   DATABASE_URL: process.env.DATABASE_URL,
    //   ACTIONS_SECRET: process.env.ACTIONS_SECRET,
    //   CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    //   CLIENT_URL: process.env.CLIENT_URL,
    //   COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
    //   NODE_ENV: process.env.NODE_ENV,
    //   PORT: process.env.PORT,
    //   REDIS_UPSTASH_TLS: process.env.REDIS_UPSTASH_TLS,
    //   TOKEN_IDENTIFICATION_HASH: process.env.TOKEN_IDENTIFICATION_HASH,
    // },
    emptyStringAsUndefined: true,
  }),
  isDevMode() {
    return this.NODE_ENV === "DEV"
  },
  isInProduction() {
    return this.NODE_ENV === "PRODUCTION"
  },
}
