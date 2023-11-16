import "dotenv/config"

import clerkClient from "@clerk/clerk-sdk-node"
import { ClerkExpressRequireAuth, ClerkExpressWithAuth, WithAuthProp } from "@clerk/clerk-sdk-node"
import { Request, Response, Router } from "express"
import { AddSteamAccount, ListSteamAccounts, CreateUser, GetUser, PlanInfinity } from "core"

import { UsersDAODatabase } from "~/infra/dao"
import { prisma } from "~/infra/libs"
import { UsersRepositoryDatabase } from "~/infra/repository"
import { ClerkAuthentication } from "~/infra/services"
import {
  GetMeController,
  CreateSteamAccountController,
  ListSteamAccountsController,
  StopFarmController,
  StartFarmController,
} from "~/presentation/controllers"
import { publisher } from "~/server"
import { FarmingUsersStorage } from "~/application/services"
import { SteamFarming } from "~/application/services/SteamFarming"

const usersRepository = new UsersRepositoryDatabase(prisma)
const usersDAO = new UsersDAODatabase(prisma)
const addSteamAccount = new AddSteamAccount(usersRepository)
const listSteamAccounts = new ListSteamAccounts(usersDAO)
const userAuthentication = new ClerkAuthentication(clerkClient)
const createUser = new CreateUser(usersRepository, userAuthentication)
const getUser = new GetUser(usersDAO)
const farmingUsersStorage = new FarmingUsersStorage()

export const router: Router = Router()

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
const steamFarming = new SteamFarming(loginSessions, userLoginSessions)

router.post("/add", (req, res) => {
  steamFarming.addUser(req.body.userId)
  console.log({
    steamFarmingUsers: steamFarming.listUsers(),
  })
  return res.status(200).end()
})
router.post("/start", (req, res) => {
  const loginAttemptID = Math.random().toString(36).substring(2, 11)
  loginSessions.set(loginAttemptID, {
    insertCodeCallback: null,
  })
  userLoginSessions.set(req.body.userId, {
    loginSessionID: loginAttemptID,
  })
  console.log({
    loginAttemptID,
  })
  steamFarming.login(req.body.userId, req.body.accountName, req.body.password)
  return res.status(200).json({
    loginAttemptID,
  })
})
router.post("/code", (req, res) => {
  const loginAttemptID = req.body.loginAttemptID
  const code = req.body.code
  console.log({
    loginAttemptID,
    code,
  })

  console.log({
    logginSessions: loginSessions.entries(),
  })
  const loginSession = loginSessions.get(loginAttemptID)
  console.log({ loginSession })
  if (!loginSession) return res.status(404).json({ message: "Login session not found" })
  console.log({ insertCodeCallback: loginSession.insertCodeCallback })
  if (!loginSession.insertCodeCallback) return res.status(404).json({ message: "Callback não foi definido." })

  loginSession.insertCodeCallback(code)

  return res.status(200).json({
    loginAttemptID,
  })
})
router.get("/list", (req, res) => {
  // console.log(loginSessions)
  // console.log(loginSessions.entries())
  return res.status(200).json({
    users: steamFarming.listUsers(),
    loginSessions: loginSessions.entries(),
    userLoginSessions: userLoginSessions.entries(),
  })
})
router.post("/set-farming-games", (req, res) => {
  const userId = req.body.userId
  const gamesID = req.body.gamesID
  steamFarming.farmGames(userId, gamesID)
  console.log({
    userId,
    gamesID,
  })

  console.log({ steamClient: steamFarming.getSteamClient(userId) })

  return res.status(200).json({ message: `Adicionado os jogos ${gamesID.map(String).join(", ")}.` })
})
