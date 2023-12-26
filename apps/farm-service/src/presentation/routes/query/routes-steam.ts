import { ClerkExpressRequireAuth, WithAuthProp } from "@clerk/clerk-sdk-node"
import { ListSteamAccounts } from "core"
import { Request, Response, Router } from "express"

import { GetUserSteamGamesUseCase } from "~/application/use-cases/GetUserSteamGamesUseCase"
import { ListSteamAccountsController, promiseHandler } from "~/presentation/controllers"
import { GetUserSteamGamesController } from "~/presentation/controllers/GetUserSteamGamesController"
import { RefreshGamesController } from "~/presentation/controllers/RefreshGamesController"
import {
  allUsersClientsStorage,
  steamAccountClientStateCacheRepository,
  usersDAO,
} from "~/presentation/instances"
import { RefreshGamesUseCase } from "~/presentation/presenters/RefreshGamesUseCase"

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
  // ClerkExpressRequireAuth(),
  async (req: WithAuthProp<Request>, res: Response) => {
    const getUserSteamGamesController = new GetUserSteamGamesController(serSteamGamesUseCase)
    const { json, status } = await promiseHandler(
      getUserSteamGamesController.handle({
        payload: {
          accountName: req.body.accountName,
          userId: req.body.userId,
        },
      })
    )

    return res.status(status).json(json)
  }
)

query_routerSteam.get(
  "/refresh-games",
  // ClerkExpressRequireAuth(),
  async (req: WithAuthProp<Request>, res: Response) => {
    const refreshGamesController = new RefreshGamesController(refreshGamesUseCase)
    const { json, status } = await promiseHandler(
      refreshGamesController.handle({
        payload: {
          accountName: req.body.accountName,
          userId: req.body.userId,
        },
      })
    )

    return res.status(status).json(json)
  }
)
