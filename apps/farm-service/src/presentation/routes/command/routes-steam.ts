import { ClerkExpressRequireAuth, WithAuthProp } from "@clerk/clerk-sdk-node"
import { AddSteamAccount, ApplicationError } from "core"
import { Request, Response, Router } from "express"
import { StopAllFarms } from "~/application/use-cases/StopAllFarms"
import { prisma } from "~/infra/libs"
import { UsersRepositoryDatabase } from "~/infra/repository"

import {
  AddSteamAccountController,
  FarmGamesController,
  StopAllFarmsController,
  StopFarmController,
} from "~/presentation/controllers"
import { AddSteamGuardCodeController } from "~/presentation/controllers/AddSteamGuardCodeController"
import { promiseHandler } from "~/presentation/controllers/promiseHandler"
import {
  allUsersClientsStorage,
  checkSteamAccountOwnerStatusUseCase,
  farmGamesUseCase,
  idGenerator,
  planRepository,
  publisher,
  steamAccountClientStateCacheRepository,
  steamAccountsRepository,
  usersClusterStorage,
  usersDAO,
  usersRepository,
} from "~/presentation/instances"
import { makeRes } from "~/utils"

export const addSteamAccount = new AddSteamAccount(usersRepository, steamAccountsRepository, idGenerator)
const stopAllFarmsUseCase = new StopAllFarms(usersClusterStorage)

export const command_routerSteam: Router = Router()

type Resolved = {
  message: string
} & Record<string, any>

command_routerSteam.post(
  "/steam-accounts",
  ClerkExpressRequireAuth(),
  async (req: WithAuthProp<Request>, res: Response) => {
    const createSteamAccountController = new AddSteamAccountController(
      addSteamAccount,
      allUsersClientsStorage,
      usersDAO,
      checkSteamAccountOwnerStatusUseCase
    )
    const { json, status } = await promiseHandler(
      createSteamAccountController.handle({
        payload: {
          accountName: req.body.accountName,
          password: req.body.password,
          userId: req.auth.userId!,
          authCode: req.body.authCode,
        },
      })
    )

    return res.status(status).json(json)
  }
)

command_routerSteam.delete(
  "/steam-accounts",
  // ClerkExpressRequireAuth(),
  async (req: WithAuthProp<Request>, res: Response) => {
    const usersRepository = new UsersRepositoryDatabase(prisma)
    const { userID, steamAccountID } = req.body

    const perform = async () => {
      const user = await usersRepository.getByID(userID)
      if (!user) throw new ApplicationError("Usuário não encontrado.", 404)
      user.steamAccounts.remove(steamAccountID)
      await usersRepository.update(user)
      return makeRes(200, `Successfully removed ${steamAccountID}.`)
    }
    const { status, json } = await promiseHandler(perform())
    return res.status(status).json(json)
  }
)

command_routerSteam.post(
  "/farm/start",
  ClerkExpressRequireAuth(),
  async (req: WithAuthProp<Request>, res: Response) => {
    const startFarmController = new FarmGamesController({
      allUsersClientsStorage,
      publisher,
      sacStateCacheRepository: steamAccountClientStateCacheRepository,
      usersClusterStorage,
      usersRepository,
      planRepository,
      farmGamesUseCase,
    })
    const { json, status } = await promiseHandler(
      startFarmController.handle({
        payload: {
          accountName: req.body.accountName,
          gamesID: req.body.gamesID,
          userId: req.auth.userId!,
        },
      })
    )

    return json ? res.status(status).json(json) : res.status(status).end()
  }
)

command_routerSteam.post(
  "/farm/stop",
  ClerkExpressRequireAuth(),
  async (req: WithAuthProp<Request>, res: Response) => {
    const perform = async () => {
      const { accountName } = req.body

      const stopFarmController = new StopFarmController(usersClusterStorage, usersRepository)
      return await stopFarmController.handle({
        payload: {
          userId: req.auth.userId!,
          accountName,
        },
      })
    }

    const { status, json } = await promiseHandler(perform())
    return json ? res.status(status).json(json) : res.status(status).end()
  }
)

command_routerSteam.post("/code", ClerkExpressRequireAuth(), async (req, res) => {
  const addSteamGuardCodeController = new AddSteamGuardCodeController(allUsersClientsStorage)
  const { json, status } = await promiseHandler(
    addSteamGuardCodeController.handle({
      payload: {
        accountName: req.body.accountName,
        code: req.body.code,
        userId: req.auth.userId!,
      },
    })
  )

  return json ? res.status(status).json(json) : res.status(status).end()
})

command_routerSteam.post("/farm/stop/all", async (req, res) => {
  const { secret } = req.body
  const stopAllFarmsController = new StopAllFarmsController(stopAllFarmsUseCase)
  const { json, status } = await promiseHandler(
    stopAllFarmsController.handle({
      payload: {
        secret,
      },
    })
  )

  return json ? res.status(status).json(json) : res.status(status).end()
})
