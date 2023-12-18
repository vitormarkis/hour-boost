import { ClerkExpressRequireAuth, LooseAuthProp, WithAuthProp } from "@clerk/clerk-sdk-node"
import { AddSteamAccount, ApplicationError, ListSteamAccounts } from "core"
import { Request, Response, Router } from "express"
import { prisma } from "~/infra/libs"
import { UsersRepositoryDatabase } from "~/infra/repository"

import {
  AddSteamAccountController,
  FarmGamesController,
  StopFarmController,
} from "~/presentation/controllers"
import { AddSteamGuardCodeController } from "~/presentation/controllers/AddSteamGuardCodeController"
import { promiseHandler } from "~/presentation/controllers/promiseHandler"
import {
  allUsersClientsStorage,
  idGenerator,
  planRepository,
  publisher,
  sacStateCacheRepository,
  steamAccountsRepository,
  steamBuilder,
  usersClusterStorage,
  usersDAO,
  usersRepository,
} from "~/presentation/instances"
import { makeRes } from "~/utils"

export const addSteamAccount = new AddSteamAccount(usersRepository, steamAccountsRepository, idGenerator)
export const listSteamAccounts = new ListSteamAccounts(usersDAO)

export const command_routerSteam: Router = Router()

type Resolved = {
  message: string
} & Record<string, any>

command_routerSteam.post(
  "/steam-accounts",
  // ClerkExpressRequireAuth(),
  async (req: WithAuthProp<Request>, res: Response) => {
    const createSteamAccountController = new AddSteamAccountController(
      addSteamAccount,
      allUsersClientsStorage,
      usersDAO
    )
    const { json, status } = await promiseHandler(
      createSteamAccountController.handle({
        payload: {
          accountName: req.body.accountName,
          password: req.body.password,
          // userId: req.auth.userId!,
          userId: req.body.userId,
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

// command_routerSteam.post("/farm/start", ClerkExpressRequireAuth(), async (req: WithAuthProp<Request>, res: Response) => {
command_routerSteam.post("/farm/start", async (req: WithAuthProp<Request>, res: Response) => {
  const startFarmController = new FarmGamesController({
    allUsersClientsStorage,
    publisher,
    sacStateCacheRepository,
    usersClusterStorage,
    usersRepository,
    planRepository,
  })
  const { json, status } = await promiseHandler(
    startFarmController.handle({
      payload: {
        accountName: req.body.accountName,
        gamesID: req.body.gamesID,
        // userId: req.auth.userId!,
        userId: req.body.userId,
      },
    })
  )

  return json ? res.status(status).json(json) : res.status(status).end()
})

// command_routerSteam.post("/farm/stop", ClerkExpressRequireAuth(), async (req: WithAuthProp<Request>, res: Response) => {
command_routerSteam.post("/farm/stop", async (req: WithAuthProp<Request>, res: Response) => {
  const perform = async () => {
    const { userId, accountName } = req.body

    const stopFarmController = new StopFarmController(usersClusterStorage, usersRepository)
    return await stopFarmController.handle({
      payload: {
        // userId: req.auth.userId!,
        accountName,
        userId,
      },
    })
  }

  const { status, json } = await promiseHandler(perform())
  return json ? res.status(status).json(json) : res.status(status).end()
})

command_routerSteam.post("/code", async (req, res) => {
  const addSteamGuardCodeController = new AddSteamGuardCodeController(allUsersClientsStorage)
  const { json, status } = await promiseHandler(
    addSteamGuardCodeController.handle({
      payload: {
        accountName: req.body.accountName,
        code: req.body.code,
        userId: req.body.userId,
      },
    })
  )

  return json ? res.status(status).json(json) : res.status(status).end()
})
