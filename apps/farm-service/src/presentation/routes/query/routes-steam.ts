import { randomUUID } from "crypto"
import { ClerkExpressRequireAuth, WithAuthProp } from "@clerk/clerk-sdk-node"
import { AddSteamAccount, ListSteamAccounts } from "core"
import { Request, Response, Router } from "express"

import { ListSteamAccountsController } from "~/presentation/controllers"
import {
  allUsersClientsStorage,
  idGenerator,
  steamAccountClientStateCacheRepository,
  steamAccountsRepository,
  usersDAO,
  usersRepository,
} from "~/presentation/instances"
import { GetUserSteamGamesController } from "~/presentation/controllers/GetUserSteamGamesController"
import { GetUserSteamGamesUseCase } from "~/application/use-cases/GetUserSteamGamesUseCase"
import { RefreshGamesController } from "~/presentation/controllers/RefreshGamesController"
import { RefreshGamesUseCase } from "~/presentation/presenters/RefreshGamesUseCase"

export const addSteamAccount = new AddSteamAccount(usersRepository, steamAccountsRepository, idGenerator)
export const listSteamAccounts = new ListSteamAccounts(usersDAO)
export const getUserSteamGamesUseCase = new GetUserSteamGamesUseCase(allUsersClientsStorage)
export const refreshGamesUseCase = new RefreshGamesUseCase(
  steamAccountClientStateCacheRepository,
  allUsersClientsStorage
)

export const query_routerSteam: Router = Router()

query_routerSteam.get(
  "/steam-accounts",
  ClerkExpressRequireAuth(),
  async (req: WithAuthProp<Request>, res: Response) => {
    const listSteamAccountsController = new ListSteamAccountsController(listSteamAccounts)
    const { json, status } = await listSteamAccountsController.handle({
      payload: {
        userId: req.auth.userId!,
      },
    })

    return res.status(status).json(json)
  }
)

query_routerSteam.get(
  "/games",
  ClerkExpressRequireAuth(),
  async (req: WithAuthProp<Request>, res: Response) => {
    const getUserSteamGamesController = new GetUserSteamGamesController(getUserSteamGamesUseCase)
    const { json, status } = await getUserSteamGamesController.handle({
      payload: {
        // userId: req.auth.userId!,
        userId: req.body.userId,
      },
    })

    return res.status(status).json(json)
  }
)

query_routerSteam.get(
  "/refresh-games",
  // ClerkExpressRequireAuth(),
  async (req: WithAuthProp<Request>, res: Response) => {
    const refreshGamesController = new RefreshGamesController(refreshGamesUseCase)
    const { json, status } = await refreshGamesController.handle({
      payload: {
        accountName: req.body.accountName,
        userId: req.body.userId,
      },
    })

    return res.status(status).json(json)
  }
)
