import { LooseAuthProp } from "@clerk/clerk-sdk-node"
import cors from "cors"
import "dotenv/config"
import express, { Application, NextFunction, Request, Response } from "express"
import { ScheduleAutoRestartUseCase } from "~/application/use-cases"
import { RestoreAccountSessionsUseCase } from "~/application/use-cases/RestoreAccountSessionsUseCase"
import { RestoreUsersSessionsUseCase } from "~/application/use-cases/RestoreUsersSessionsUseCase"
import {
  autoRestartCron,
  autoRestarterScheduler,
  steamAccountsDAO,
  usersClusterStorage,
  usersRepository,
} from "~/presentation/instances"

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

const restoreUsersSessionsUseCase = new RestoreUsersSessionsUseCase(usersClusterStorage)
const restoreAccountSessionsUseCase = new RestoreAccountSessionsUseCase(steamAccountsDAO, autoRestartCron)

const scheduleAutoRestartUseCase = new ScheduleAutoRestartUseCase(autoRestarterScheduler, autoRestartCron)

async function main() {
  try {
    const users = await usersRepository.findMany()
    restoreUsersSessionsUseCase.execute({ users })
    await restoreAccountSessionsUseCase.execute()

    // await restoreAccountSessionsUseCase.execute({
    //   whitelistAccountNames: ["chapilson2"],
    // })

    // const [error] = await scheduleAutoRestartUseCase.execute({
    //   accountName: "versalebackup",
    //   intervalInSeconds: 15,
    // })
    // if (error) {
    //   console.log({ errorAutoRestartingAccount: error })
    // }
  } catch (error) {
    console.log("main error", error)
  }
}

main()

app.listen(process.env.PORT ?? 4000, () => {
  console.log(`Server is running on port ${process.env.PORT ?? 4000}`)
})
