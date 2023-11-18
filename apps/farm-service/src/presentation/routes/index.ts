import "dotenv/config"

import clerkClient from "@clerk/clerk-sdk-node"
import { ClerkExpressRequireAuth, ClerkExpressWithAuth, WithAuthProp } from "@clerk/clerk-sdk-node"
import { Request, Response, Router } from "express"
import { AddSteamAccount, ListSteamAccounts, CreateUser, GetUser, PlanInfinity } from "core"

import { UsersDAODatabase } from "~/infra/dao"
import { UsersRepositoryDatabase } from "~/infra/repository"
import { prisma } from "~/infra/libs"
import { ClerkAuthentication } from "~/infra/services"
import {
  GetMeController,
  CreateSteamAccountController,
  ListSteamAccountsController,
  StopFarmController,
  StartFarmController,
} from "~/presentation/controllers"
import { publisher, steamFarming } from "~/server"
import { FarmingUsersStorage } from "~/application/services"
import { getTimeoutPromise, makeResError } from "~/utils"
import SteamUser from "steam-user"

const usersRepository = new UsersRepositoryDatabase(prisma)
const usersDAO = new UsersDAODatabase(prisma)
// const usersDAO = new UsersDAOInMemory()
const addSteamAccount = new AddSteamAccount(usersRepository)
const listSteamAccounts = new ListSteamAccounts(usersDAO)
const userAuthentication = new ClerkAuthentication(clerkClient)
const createUser = new CreateUser(usersRepository, userAuthentication)
const getUser = new GetUser(usersDAO)
const farmingUsersStorage = new FarmingUsersStorage()

export const router: Router = Router()

const loginErrorMessages: Record<number, string> = {
  5: "Invalid password or steam account.",
  61: "Invalid Password",
  63:
    "Account login denied due to 2nd factor authentication failure. " +
    "If using email auth, an email has been sent.",
  65: "Account login denied due to auth code being invalid",
  66: "Account login denied due to 2nd factor auth failure and no mail has been sent",
  84: "Rate limit exceeded.",
}

router.get("/me", ClerkExpressWithAuth(), async (req: WithAuthProp<Request>, res: Response) => {
  const getMeController = new GetMeController(usersRepository, createUser, getUser)
  const { json, status } = await getMeController.handle({
    payload: {
      userId: req.auth.userId,
    },
  })

  return res.status(status).json(json)
})

router.post(
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

router.get(
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

// router.post("/farm/start", ClerkExpressRequireAuth(), async (req: WithAuthProp<Request>, res: Response) => {
router.post("/farm/start", async (req: WithAuthProp<Request>, res: Response) => {
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

// router.post("/farm/stop", ClerkExpressRequireAuth(), async (req: WithAuthProp<Request>, res: Response) => {
router.post("/farm/stop", async (req: WithAuthProp<Request>, res: Response) => {
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

router.get("/farm/plan-status", async (req, res) => {
  try {
    const user = await usersRepository.getByID(req.body.userId)
    if (!user) {
      return res.status(404).json({
        message: "User doesn't exists.",
      })
    }

    if (user.plan instanceof PlanInfinity) {
      return res.json({
        plan: {
          ...user.plan,
        },
      })
    }

    return res.json({
      plan: {
        ...user.plan,
        timeLeftHours: `${user.plan.getUsageLeft() / 60 / 60} horas`,
        timeLeft: user.plan.getUsageLeft(),
        usageTotalMinutes: `${user.plan.getUsageTotal() / 60} minutos`,
        usageTotal: user.plan.getUsageTotal(),
        usages: user.plan.usages.length,
      },
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      message: "Erro interno no servidor.",
    })
  }
})

router.get("/up", (req, res) => {
  console.log({
    farmingUsers: farmingUsersStorage.listFarmingStatusCount(),
    date: new Date(),
  })

  return res.status(200).json({
    message: "server is up !",
  })
})

// ============
export type UserID = string
export type LoginSessionID = string
export type LoginSessionConfig = {
  insertCodeCallback: ((code: string) => void) | null
}
const userLoginSessions: Map<UserID, { loginSessionID: LoginSessionID }> = new Map()
const loginSessions: Map<LoginSessionID, LoginSessionConfig> = new Map()

type Resolved = {
  message: string
} & Record<string, any>

router.post("/add-account", async (req, res) => {
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

router.post("/code", async (req, res) => {
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

router.get("/list", (req, res) => {
  return res.status(200).json({
    users: steamFarming.listUsers(),
    loginSessions: loginSessions.entries(),
    userLoginSessions: userLoginSessions.entries(),
  })
})
