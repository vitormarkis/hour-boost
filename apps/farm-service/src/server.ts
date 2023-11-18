import "dotenv/config"
import { LooseAuthProp } from "@clerk/clerk-sdk-node"
import express, { Application, NextFunction, Request, Response } from "express"
import cors from "cors"

import {
  PersistUsageHandler,
  StartFarmPlanHandler,
  LogSteamStopFarmHandler,
  LogSteamStartFarmHandler,
  LogCompleteInfinityFarmSessionHandler,
  LogUserCompleteFarmSessionHandler,
  LogUserFarmedHandler,
} from "~/domain/handler"
import { prisma } from "~/infra/libs"
import { Publisher } from "~/infra/queue"
import { PlanRepositoryDatabase } from "~/infra/repository"
import { router } from "~/presentation/routes"
import { SteamFarming } from "~/application/services"

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
  console.error(err)
  return res.status(401).send("Unauthenticated!")
})

const planRepository = new PlanRepositoryDatabase(prisma)
export const publisher = new Publisher()
export const steamFarming = new SteamFarming(publisher)

publisher.register(new PersistUsageHandler(planRepository))
publisher.register(new StartFarmPlanHandler())
publisher.register(new StartFarmPlanHandler())
publisher.register(new LogCompleteInfinityFarmSessionHandler())

// publisher.register(new LogUserFarmedHandler())

publisher.register(new LogSteamStopFarmHandler())
publisher.register(new LogSteamStartFarmHandler())
publisher.register(new LogUserCompleteFarmSessionHandler())

app.listen(process.env.PORT ?? 4000, () => {
  console.log(`Server is running on port ${process.env.PORT ?? 4000}`)
})
