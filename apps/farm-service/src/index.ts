import "dotenv/config"
import { LooseAuthProp } from "@clerk/clerk-sdk-node"
import express, { Application, NextFunction, Request, Response } from "express"
import cors from "cors"

import { prisma } from "./infra/libs/prisma"
import { Publisher } from "./infra/queue/Publisher"
import { PersistUsageHandler } from "./domain/handler/PersistUsageHandler"
import { UsagesRepositoryDatabase } from "./infra/repository/UsagesRepositoryDatabase"
import { router } from "./presentation/routes"

const app: Application = express()
app.use(
  cors({
    origin: "*",
  })
)
app.use(express.json())
app.use(router)
declare global {
  namespace Express {
    interface Request extends LooseAuthProp {}
  }
}
const usageRepository = new UsagesRepositoryDatabase(prisma)

export const publisher = new Publisher()

publisher.register(new PersistUsageHandler(usageRepository))
publisher.register({
  operation: "user-complete-farm-session",
  notify: async () => {
    console.log("User has completed a farm session.")
  },
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  return res.status(401).send("Unauthenticated!")
})

app.listen(3309, () => {
  console.log("Server is running on port 3309")
})
