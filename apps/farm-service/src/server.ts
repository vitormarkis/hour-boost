import { LooseAuthProp } from "@clerk/clerk-sdk-node"
import cors from "cors"
import "dotenv/config"
import express, { Application, NextFunction, Request, Response } from "express"

declare global {
  namespace Express {
    interface Request extends LooseAuthProp {}
  }
}

import { command_routerSteam } from "~/presentation/routes/command"
import { command_routerPlan } from "~/presentation/routes/command/routes-plan"
import {
  query_routerGeneral,
  query_routerPlan,
  query_routerSteam,
  query_routerUser,
} from "~/presentation/routes/query"

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
app.use(command_routerPlan)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err)
  return res.status(500).json({
    message: "Something went wrong.",
    err,
  })
})

app.listen(process.env.PORT ?? 4000, () => {
  console.log(`Server is running on port ${process.env.PORT ?? 4000}`)
})
