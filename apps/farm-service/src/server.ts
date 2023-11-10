import "dotenv/config"
import { LooseAuthProp } from "@clerk/clerk-sdk-node"
import express, { Application, NextFunction, Request, Response } from "express"
import cors from "cors"

import { PersistUsageHandler } from "~/domain/handler"
import { prisma } from "~/infra/libs"
import { Publisher } from "~/infra/queue"
import { UsagesRepositoryDatabase } from "~/infra/repository"
import { router } from "~/presentation/routes"

declare global {
  namespace Express {
    interface Request extends LooseAuthProp {}
  }
}

const app: Application = express()
app.use(
  cors({
    origin: "https://hour-boost.vercel.app/",
  })
)
app.use(express.json())
app.use(router)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  return res.status(401).send("Unauthenticated!")
})

const usageRepository = new UsagesRepositoryDatabase(prisma)

export const publisher = new Publisher()

publisher.register(new PersistUsageHandler(usageRepository))
publisher.register({
  operation: "user-complete-farm-session",
  notify: async () => {
    console.log("User has completed a farm session.")
  },
})

app.listen(process.env.PORT ?? 4000, () => {
  console.log(`Server is running on port ${process.env.PORT ?? 4000}`)
})
