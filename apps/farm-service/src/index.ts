import "dotenv/config"
import {
  ClerkExpressRequireAuth,
  ClerkExpressWithAuth,
  LooseAuthProp,
  WithAuthProp,
} from "@clerk/clerk-sdk-node"
import express, { Application, NextFunction, Request, Response } from "express"
import { prisma } from "./libs/prisma"
import clerkClient from "@clerk/clerk-sdk-node"
import { UserSession, User, AddSteamAccount, ListSteamAccounts, CreateUser, GetUser, makeID } from "core"
import { UsersRepositoryDatabase } from "./infra/repository/users-repository-database"
import cors from "cors"
import { CreateSteamAccountController } from "./presentation/controllers/CreateSteamAccountController"
import { ListSteamAccountsController } from "./presentation/controllers/ListSteamAccountsController"
import { UsersDAODatabase } from "./infra/dao/users-data-access-object"
import { GetMeController } from "./presentation/controllers/GetMeController"
import { ClerkAuthentication } from "./services/ClerkAuthentication"
import { EventNames, UserFarmService, Publisher } from "./UserFarmService"
import { UserHasFarmedCommand } from "./queue/commands/UserHasFarmedCommand"
import { UserCompleteFarmSessionCommand } from "./queue/commands/UserCompleteFarmSessionCommand"

const usersRepository = new UsersRepositoryDatabase(prisma)
const usersDAO = new UsersDAODatabase(prisma)
const addSteamAccount = new AddSteamAccount(usersRepository)
const listSteamAccounts = new ListSteamAccounts(usersDAO)
const userAuthentication = new ClerkAuthentication(clerkClient)
const createUser = new CreateUser(usersRepository, userAuthentication)
const getUser = new GetUser(usersDAO)

const app: Application = express()
app.use(
  cors({
    origin: "*",
  })
)
app.use(express.json())
declare global {
  namespace Express {
    interface Request extends LooseAuthProp {}
  }
}

app.get("/me", ClerkExpressWithAuth(), async (req: WithAuthProp<Request>, res: Response) => {
  const getMeController = new GetMeController(usersRepository, createUser, getUser)
  const { json, status } = await getMeController.handle({
    payload: {
      userId: req.auth.userId,
    },
  })

  console.log({
    status,
    json,
  })
  return res.status(status).json(json)
})

app.post("/steam-accounts", ClerkExpressRequireAuth(), async (req: WithAuthProp<Request>, res: Response) => {
  const createSteamAccountController = new CreateSteamAccountController(addSteamAccount)
  const { json, status } = await createSteamAccountController.handle({
    payload: {
      accountName: req.body.accountName,
      password: req.body.password,
      userId: req.auth.userId!,
    },
  })

  return res.status(status).json(json)
})

app.get("/steam-accounts", ClerkExpressRequireAuth(), async (req: WithAuthProp<Request>, res: Response) => {
  const listSteamAccountsController = new ListSteamAccountsController(listSteamAccounts)
  const { json, status } = await listSteamAccountsController.handle({
    payload: {
      userId: req.auth.userId!,
    },
  })

  return res.status(status).json(json)
})

export function makePublisher(): Publisher {
  const eventHandlers: Map<EventNames, Function[]> = new Map()

  return {
    emit(eventName, data) {
      console.log("Evento recebido:", eventName, data)
      const event = eventHandlers.get(eventName)
      console.log("Evento em questao:", event)
      if (!event) return
      for (const handler of event) {
        console.log("chamando todos handlers!", event)
        handler(data)
      }
    },
    register(eventName, handler) {
      const eventCurrentEventHandlers = eventHandlers.get(eventName)
      if (!eventCurrentEventHandlers) eventHandlers.set(eventName, [])
      eventHandlers.get(eventName)?.push(handler)
      return () => eventHandlers.get(eventName)?.filter(cb => cb !== handler)
    },
  }
}
const publisher = makePublisher()

publisher.register("user-complete-farm-session", async (data: UserCompleteFarmSessionCommand) => {
  const { id_usage } = await prisma.usage.create({
    data: {
      amountTime: data.props.usage.amountTime,
      createdAt: data.props.usage.createdAt,
      id_usage: data.props.usage.id_usage,
      plan_id: data.props.planId,
    },
  })

  console.log(`Prisma: ${id_usage} usage created.`)
  console.log(`Prisma: ${data.props.usageLeft / 60 / 60} horas restantes.`)
  console.log(`Prisma: ${data.props.username} farmou ${data.props.usage.amountTime} segundos.`)
})

const farmingUsers: Map<string, UserFarmService> = new Map()

app.post("/farm/start", async (req, res) => {
  try {
    const user = await usersRepository.getByID(req.body.userId)

    const actualFarmingUser = farmingUsers.get(user.username)
    if (actualFarmingUser) {
      return res.status(400).json({
        message: `${user.username} já está farmando.`,
      })
    }
    const userFarmService = new UserFarmService(publisher, user)
    farmingUsers.set(user.username, userFarmService)
    userFarmService.startFarm()

    return res.json({
      message: `Starting farming for user ${user.username}`,
    })
  } catch (e) {
    return res.status(500).json({
      message: "Erro interno no servidor.",
    })
  }
})

app.post("/farm/stop", async (req, res) => {
  try {
    const user = await usersRepository.getByID(req.body.userId)
    const actualFarmingUser = farmingUsers.get(user.username)
    if (!actualFarmingUser) {
      return res.status(400).json({
        message: `${user.username} não está farmando.`,
      })
    }
    actualFarmingUser.stopFarm()
    return res.json({
      message: `Stopping the farming for user ${user.username}`,
    })
  } catch (e) {
    return res.status(500).json({
      message: "Erro interno no servidor.",
    })
  }
})

app.get("/farm/plan-status", async (req, res) => {
  try {
    const user = await usersRepository.getByID(req.body.userId)
    return res.json({
      plan: {
        ...user.plan,
        timeLeftHours: `${user.plan.getTimeLeft() / 60 / 60} horas`,
        timeLeft: user.plan.getTimeLeft(),
        usageTotalMinutes: `${user.plan.getUsageTotal() / 60} minutos`,
        usageTotal: user.plan.getUsageTotal(),
        usages: user.plan.usages.length,
      },
    })
  } catch (e) {
    return res.status(500).json({
      message: "Erro interno no servidor.",
    })
  }
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  return res.status(401).send("Unauthenticated!")
})

app.listen(3309, () => {
  console.log("Server is running on port 3309")
})
