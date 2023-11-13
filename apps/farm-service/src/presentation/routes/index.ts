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
  return res.status(200).json({
    message: "server is up !!",
  })
})