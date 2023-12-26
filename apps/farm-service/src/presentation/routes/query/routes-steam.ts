import { ClerkExpressRequireAuth, WithAuthProp } from "@clerk/clerk-sdk-node"
import { ListSteamAccounts } from "core"
import { Request, Response, Router } from "express"

import { ListSteamAccountsController } from "~/presentation/controllers"
import {
  allUsersClientsStorage,
  steamAccountClientStateCacheRepository,
  usersDAO,
} from "~/presentation/instances"
import { GetUserSteamGamesController } from "~/presentation/controllers/GetUserSteamGamesController"
import { RefreshGamesController } from "~/presentation/controllers/RefreshGamesController"
import { RefreshGamesUseCase } from "~/presentation/presenters/RefreshGamesUseCase"
import { GetUserSteamGamesUseCase } from "~/application/use-cases/GetUserSteamGamesUseCase"

const listSteamAccounts = new ListSteamAccounts(usersDAO)
const refreshGamesUseCase = new RefreshGamesUseCase(
  steamAccountClientStateCacheRepository,
  allUsersClientsStorage
)
const serSteamGamesUseCase = new GetUserSteamGamesUseCase(
  steamAccountClientStateCacheRepository,
  refreshGamesUseCase
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
    const getUserSteamGamesController = new GetUserSteamGamesController(serSteamGamesUseCase)
    const { json, status } = await getUserSteamGamesController.handle({
      payload: {
        accountName: req.body.accountName,
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
