import { ClerkExpressRequireAuth, WithAuthProp } from "@clerk/clerk-sdk-node"
import { AddSteamAccount, ListSteamAccounts } from "core"
import { randomUUID } from "crypto"
import { Request, Response, Router } from "express"

import { ListSteamAccountsController } from "~/presentation/controllers"
import { usersDAO, usersRepository } from "~/presentation/instances"

export const addSteamAccount = new AddSteamAccount(usersRepository, {
  makeID: () => randomUUID(),
})
export const listSteamAccounts = new ListSteamAccounts(usersDAO)

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
