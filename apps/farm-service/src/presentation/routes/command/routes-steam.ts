import { WithAuthProp } from "@clerk/clerk-sdk-node"
import { AddSteamAccount, ApplicationError, ListSteamAccounts } from "core"
import { randomUUID } from "crypto"
import { Request, Response, Router } from "express"
import { prisma } from "~/infra/libs"
import { UsersRepositoryDatabase } from "~/infra/repository"

import {
  AddSteamAccountController,
  FarmGamesController,
  StopFarmController,
} from "~/presentation/controllers"
import { promiseHandler } from "~/presentation/controllers/promiseHandler"
import {
  farmingUsersStorage,
  publisher,
  userSteamClientsStorage,
  usersDAO,
  usersRepository,
} from "~/presentation/instances"
import { loginErrorMessages } from "~/presentation/routes"
import { getTimeoutPromise, makeRes, makeResError } from "~/utils"

export const addSteamAccount = new AddSteamAccount(usersRepository, {
  makeID: () => randomUUID(),
})
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
      userSteamClientsStorage,
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
  const startFarmController = new FarmGamesController(
    farmingUsersStorage,
    publisher,
    usersRepository,
    userSteamClientsStorage
  )
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
    const { userSteamClients } = userSteamClientsStorage.get(userId)
    const { steamAccountClient: sac } = userSteamClients.getAccountClient(accountName)
    sac.farmGames([])

    const stopFarmController = new StopFarmController(farmingUsersStorage, publisher, usersRepository)
    return await stopFarmController.handle({
      payload: {
        // userId: req.auth.userId!,
        userId: req.body.userId,
      },
    })
  }

  const { status, json } = await promiseHandler(perform())
  return json ? res.status(status).json(json) : res.status(status).end()
})

command_routerSteam.post("/code", async (req, res) => {
  try {
    const { code, userId, accountName } = req.body

    const { userSteamClients } = userSteamClientsStorage.get(userId)
    const { steamAccountClient: sac } = userSteamClients.getAccountClient(accountName)
    if (!sac) throw new ApplicationError("User never tried to log in.")

    const onSteamGuard = sac.getLastHandler(accountName, "steamGuard")
    onSteamGuard(code)

    const resolved = await Promise.any([
      new Promise<Resolved>(res => {
        sac.client.on("loggedOn", (details, parental) => {
          res({ message: `CLX: Login succesfully`, details, parental })
        })
      }),
      new Promise<Resolved>(res => {
        sac.client.on("error", error => {
          res({
            message: `CLX: Error of type ${loginErrorMessages[error.eresult]}`,
            error,
          })
        })
      }),
      getTimeoutPromise<Resolved>(10, {
        message: "Server timed out :D",
      }),
    ])

    return res.status(200).json(resolved)
  } catch (error) {
    const { json, status } = makeResError(error, 500)
    return res.status(status).json(json)
  }
})
