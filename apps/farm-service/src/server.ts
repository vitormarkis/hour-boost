import "dotenv/config"
import { LooseAuthProp } from "@clerk/clerk-sdk-node"
import express, { Application, NextFunction, Request, Response } from "express"
import cors from "cors"

import { PersistUsageHandler, StartFarmPlanHandler } from "~/domain/handler"
import { prisma } from "~/infra/libs"
import { Publisher } from "~/infra/queue"
import { PlanRepositoryDatabase, PlanRepositoryInMemory, UsagesRepositoryDatabase } from "~/infra/repository"
import { router } from "~/presentation/routes"
import { LogCompleteInfinityFarmSessionHandler } from "~/domain/handler/LogCompleteInfinityFarmSessionHandler"

declare global {
  namespace Express {
    interface Request extends LooseAuthProp {}
  }
}

const app: Application = express()
app.use(
  cors({
    origin: "*",
  })
)
app.use(express.json())
app.use(router)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  return res.status(401).send("Unauthenticated!")
})

const planRepository = new PlanRepositoryDatabase(prisma)

export const publisher = new Publisher()

publisher.register(new PersistUsageHandler(planRepository))
publisher.register({
  operation: "user-complete-farm-session",
  notify: async () => {
    console.log("User has completed a farm session.")
  },
})
publisher.register(new StartFarmPlanHandler())
publisher.register(new LogCompleteInfinityFarmSessionHandler())

app.listen(process.env.PORT ?? 4000, () => {
  console.log(`Server is running on port ${process.env.PORT ?? 4000}`)
})
