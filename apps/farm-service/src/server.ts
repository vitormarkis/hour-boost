import type { LooseAuthProp } from "@clerk/clerk-sdk-node"
import cookieParser from "cookie-parser"
import cors from "cors"
import "dotenv/config"
import express, { type Application, type NextFunction, type Request, type Response } from "express"
import { RestoreAccountManySessionsUseCase } from "~/application/use-cases/RestoreAccountManySessionsUseCase"
import { RestoreUsersSessionsUseCase } from "~/application/use-cases/RestoreUsersSessionsUseCase"
import { isProductionServerOn } from "~/infra/helpers/isProductionServerOn"
import {
  autoRestartCron,
  steamAccountsDAO,
  usersClusterStorage,
  usersRepository,
} from "~/presentation/instances"
import { command_routerSteam } from "~/presentation/routes/command"
import { command_routerPlan } from "~/presentation/routes/command/routes-plan"
import {
  query_routerGeneral,
  query_routerPlan,
  query_routerSteam,
  query_routerUser,
} from "~/presentation/routes/query"
import { query_routerAdmin } from "~/presentation/routes/query/routes-admin"
import { env } from "./env"

const log = console.log

console.log = function log() {
  const args = Array.from(arguments)
  const [date] = new Date().toISOString().split(".")
  args.unshift(date + ": ")
  // @ts-expect-error
  log.apply(console, args)
}

declare global {
  namespace Express {
    interface Request extends LooseAuthProp {}
  }
}

const app: Application = express()
app.use(
  cors({
    origin: env.CLIENT_URL,
  })
)
app.use(express.json())
app.use(cookieParser())

app.use(query_routerUser)
app.use("/admin", query_routerAdmin)
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
const restoreAccountManySessionsUseCase = new RestoreAccountManySessionsUseCase(
  steamAccountsDAO,
  autoRestartCron
)

async function main() {
  if (env.NODE_ENV !== "PRODUCTION") {
    const is = await isProductionServerOn()
    if (is) throw new Error("PROD SERVER ON")
  }

  const users = await usersRepository.findMany()
  restoreUsersSessionsUseCase.execute({ users })
  await restoreAccountManySessionsUseCase.execute({
    batchOptions: {
      batchAmount: 5,
      noiseInSeconds: 5,
      intervalInSeconds: 60 * 3, // 3 minutes
    },
  })
  // await restoreAccountManySessionsUseCase.execute({
  //   whitelistAccountNames: ["soulfault"],
  // })
}

main()

app.listen(process.env.PORT ?? 4000, () => {
  console.log(`Server is running on port ${process.env.PORT ?? 4000}`)
})
