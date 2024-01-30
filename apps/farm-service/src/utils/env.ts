// import { z } from "zod"
// import "dotenv/config"

// const envSchema = z.object({
//   NODE_ENV: z.enum(["TEST", "PROD", "DEV"]),
//   CLERK_SECRET_KEY: z.string().min(1),
//   REDIS_UPSTASH_TLS: z.string().min(1),
//   DATABASE_URL: z.string().min(1),
//   PORT: z
//     .custom<number>()
//     .refine(value => value ?? false, "PORT Required")
//     .refine(value => Number.isFinite(Number(value)), "Invalid number")
//     .transform(value => Number(value)),
//   ACTIONS_SECRET: z.string().uuid(),
// })

// export const env = {
//   ...envSchema.parse(process.env),
//   isDEVMode() {
//     return this.NODE_ENV === "DEV"
//   },
//   isProduction() {
//     return this.NODE_ENV === "PROD"
//   },
//   isTestMode() {
//     return this.NODE_ENV === "TEST"
//   },
// }

// console.log("Environment variables all correctly set.")
