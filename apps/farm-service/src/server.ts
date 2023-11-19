import { LooseAuthProp } from "@clerk/clerk-sdk-node"
import cors from "cors"
import "dotenv/config"
import express, { Application, NextFunction, Request, Response } from "express"

import {
  LogCompleteInfinityFarmSessionHandler,
  LogSteamStartFarmHandler,
  LogSteamStopFarmHandler,
  LogUserCompleteFarmSessionHandler,
  PersistUsageHandler,
  StartFarmPlanHandler,
} from "~/domain/handler"
import { planRepository, publisher } from "~/presentation/instances"

import { command_routerSteam } from "~/presentation/routes/command"
import {
  query_routerGeneral,
  query_routerPlan,
  query_routerSteam,
  query_routerUser,
} from "~/presentation/routes/query"

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

app.use(query_routerUser)
app.use(query_routerSteam)
app.use(query_routerPlan)
app.use(query_routerGeneral)
app.use(command_routerSteam)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err)
  return res.status(401).send("Unauthenticated!")
})

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
