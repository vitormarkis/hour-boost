import { LooseAuthProp } from "@clerk/clerk-sdk-node"
import cors from "cors"
import "dotenv/config"
import express, { Application, NextFunction, Request, Response } from "express"
import { RestoreUsersSessionsUseCase } from "~/application/use-cases/RestoreUsersSessionsUseCase"
import {
  allUsersClientsStorage,
  planRepository,
  steamAccountClientStateCacheRepository,
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
import { Logger } from "~/utils/Logger"

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

interface RestoreSessionSchema {
  accountName: string
  key: string
}

const restoreUsersSessionsUseCase = new RestoreUsersSessionsUseCase(usersClusterStorage)

async function main() {
  try {
    const users = await usersRepository.findMany()
    restoreUsersSessionsUseCase.execute({ users })

    const logger = new Logger("MAIN")
    const loggedUsersKeys = await steamAccountClientStateCacheRepository.getUsersRefreshToken()
    logger.log("got accounts keys ", loggedUsersKeys)
    const sessionsSchema = loggedUsersKeys.reduce((acc, key) => {
      const [accountName] = key.split(":")
      acc.push({
        accountName,
        key,
      })
      return acc
    }, [] as RestoreSessionSchema[])
    const sessionsPromises = sessionsSchema.map(async ({ accountName }) => {
      const foundRefreshToken = await steamAccountClientStateCacheRepository.getRefreshToken(accountName)
      if (!foundRefreshToken) return null

      return {
        accountName,
        ...foundRefreshToken,
      }
    })
    const sessions = await Promise.all(sessionsPromises)
    logger.log(
      "got refresh tokens for each account ",
      sessions.map(s => s?.accountName)
    )
    for (const session of sessions) {
      if (!session) continue
      const { accountName, refreshToken, userId, username, planId } = session
      const plan = await planRepository.getById(planId)
      if (!plan) {
        console.log(
          `[NSTH]: Plano não encontrado com id [${planId}]; username: [${username}]; accountName: [${accountName}]`
        )
        continue
      }
      const state = await steamAccountClientStateCacheRepository.get(accountName)
      const sac = allUsersClientsStorage.addSteamAccountFrom0({ accountName, userId, username, planId })
      const userCluster = usersClusterStorage.getOrAdd(username, plan).addSAC(sac)
      if (state && state.isFarming) {
        userCluster.farmWithAccount(accountName, state.gamesPlaying, planId)
      }
      logger.log(`Restoring session for account [${accountName}].`)
      sac.loginWithToken(refreshToken)
    }
  } catch (error) {
    console.log("main error", error)
  }
}

main()

app.listen(process.env.PORT ?? 4000, () => {
  console.log(`Server is running on port ${process.env.PORT ?? 4000}`)
})
