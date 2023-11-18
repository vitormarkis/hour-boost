import { ClerkExpressRequireAuth, WithAuthProp } from "@clerk/clerk-sdk-node"
import { AddSteamAccount, ListSteamAccounts } from "core"
import { Request, Response, Router } from "express"

import {
  CreateSteamAccountController,
  StartFarmController,
  StopFarmController,
} from "~/presentation/controllers"
import {
  farmingUsersStorage,
  publisher,
  steamFarming,
  usersDAO,
  usersRepository,
} from "~/presentation/instances"
import { loginErrorMessages } from "~/presentation/routes"
import { getTimeoutPromise, makeResError } from "~/utils"

export const addSteamAccount = new AddSteamAccount(usersRepository)
export const listSteamAccounts = new ListSteamAccounts(usersDAO)

export const command_routerSteam: Router = Router()

type Resolved = {
  message: string
} & Record<string, any>

command_routerSteam.post(
  "/steam-accounts",
  ClerkExpressRequireAuth(),
  async (req: WithAuthProp<Request>, res: Response) => {
    const createSteamAccountController = new CreateSteamAccountController(addSteamAccount)
    const { json, status } = await createSteamAccountController.handle({
      payload: {
        accountName: req.body.accountName,
        password: req.body.password,
        userId: req.auth.userId!,
      },
    })

    return res.status(status).json(json)
  }
)

// command_routerSteam.post("/farm/start", ClerkExpressRequireAuth(), async (req: WithAuthProp<Request>, res: Response) => {
command_routerSteam.post("/farm/start", async (req: WithAuthProp<Request>, res: Response) => {
  const { userId, gamesID } = req.body
  const { userSteamClient: usc } = steamFarming.getUser(userId)
  if (!usc) throw new Error("This account never logged in.")
  usc.farmGames(gamesID)

  const startFarmController = new StartFarmController(farmingUsersStorage, publisher, usersRepository)
  const { json, status } = await startFarmController.handle({
    payload: {
      // userId: req.auth.userId!,
      userId: req.body.userId,
    },
  })

  console.log({ json, status })

  return json ? res.status(status).json(json) : res.status(status).end()
})

// command_routerSteam.post("/farm/stop", ClerkExpressRequireAuth(), async (req: WithAuthProp<Request>, res: Response) => {
command_routerSteam.post("/farm/stop", async (req: WithAuthProp<Request>, res: Response) => {
  const { userId } = req.body
  const { userSteamClient: usc } = steamFarming.getUser(userId)
  if (!usc) throw new Error("This account never logged in.")
  usc.farmGames([])

  const stopFarmController = new StopFarmController(farmingUsersStorage, publisher, usersRepository)
  const { json, status } = await stopFarmController.handle({
    payload: {
      // userId: req.auth.userId!,
      userId: req.body.userId,
    },
  })

  return json ? res.status(status).json(json) : res.status(status).end()
})

command_routerSteam.post("/add-account", async (req, res) => {
  try {
    const { userId, username, accountName, password } = req.body

    const { userSteamClient: usc } = steamFarming.addUser(userId, username)
    usc.login(accountName, password)

    const resolved = await Promise.any([
      new Promise<Resolved>(res => {
        usc.client.on("steamGuard", domain => {
          res({ message: `CLX: Sending code to email ${domain}` })
        })
      }),
      new Promise<Resolved>(res => {
        usc.client.on("error", error => {
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

command_routerSteam.post("/code", async (req, res) => {
  try {
    const { code, userId, accountName } = req.body

    const { userSteamClient: usc } = steamFarming.getUser(userId)
    if (!usc) throw new Error("User never tried to log in.")

    const onSteamGuard = usc.getLastHandler(accountName, "steamGuard")
    onSteamGuard(code)

    const resolved = await Promise.any([
      new Promise<Resolved>(res => {
        usc.client.on("loggedOn", (details, parental) => {
          res({ message: `CLX: Login succesfully`, details, parental })
        })
      }),
      new Promise<Resolved>(res => {
        usc.client.on("steamGuard", (details, parental) => {
          res({ message: `CLX: Steam Guard invalid, try again.`, details, parental })
        })
      }),
      new Promise<Resolved>(res => {
        usc.client.on("error", error => {
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
