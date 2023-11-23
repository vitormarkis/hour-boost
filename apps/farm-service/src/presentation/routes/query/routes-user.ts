import "dotenv/config"

import { ClerkExpressWithAuth, WithAuthProp } from "@clerk/clerk-sdk-node"
import { ApplicationError, CreateUser, GetUser, PlanInfinity } from "core"
import { Request, Response, Router } from "express"

import { GetMeController, Resolved } from "~/presentation/controllers"
import {
  farmingUsersStorage,
  userAuthentication,
  usersDAO,
  userSteamClientsStorage,
  usersRepository,
} from "~/presentation/instances"
import { getTimeoutPromise, makeResError } from "~/utils"
import { EVENT_PROMISES_TIMEOUT_IN_SECONDS } from "~/consts"

export const query_routerUser: Router = Router()
export const createUser = new CreateUser(usersRepository, userAuthentication)
export const getUser = new GetUser(usersDAO)

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

query_routerUser.get("/me", ClerkExpressWithAuth(), async (req: WithAuthProp<Request>, res: Response) => {
  const getMeController = new GetMeController(usersRepository, createUser, getUser)
  const { json, status } = await getMeController.handle({
    payload: {
      userId: req.auth.userId,
    },
  })

  return res.status(status).json(json)
})

query_routerUser.get("/farm/plan-status", async (req, res) => {
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
        usages: user.plan.usages.data.length,
      },
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      message: "Erro interno no servidor.",
    })
  }
})

query_routerUser.get("/up", (req, res) => {
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

// query_routerUser.post("/code", async (req, res) => {
//   try {
//     const { code, userId, accountName } = req.body

//     const { userSteamClients } = userSteamClientsStorage.get(userId)
//     const { steamAccountClient: sac } = userSteamClients.getAccountClient(accountName)
//     if (!sac) throw new ApplicationError("User never tried to log in.")

//     const onSteamGuard = sac.getLastHandler(accountName, "steamGuard")
//     onSteamGuard(code)

//     const resolved = await Promise.any([
//       new Promise<Resolved>(res => {
//         sac.client.on("loggedOn", (details, parental) => {
//           res({
//             json: { message: `CLX: Login succesfully`, details, parental },
//             status: 200,
//           })
//         })
//       }),
//       new Promise<Resolved>(res => {
//         sac.client.on("steamGuard", (details, parental) => {
//           res({
//             json: { message: `CLX: Steam Guard invalid, try again.`, details, parental },
//             status: 200,
//           })
//         })
//       }),
//       new Promise<Resolved>(res => {
//         sac.client.on("error", error => {
//           res({
//             json: {
//               message: `CLX: Error of type ${loginErrorMessages[error.eresult]}`,
//               error,
//             },
//             status: 400,
//           })
//         }),
//           getTimeoutPromise<Resolved>(EVENT_PROMISES_TIMEOUT_IN_SECONDS, {
//             json: {
//               message: "Server timed out :D",
//             },
//             status: 400,
//           })
//       }),
//     ])

//     return res.status(200).json(resolved)
//   } catch (error) {
//     const { json, status } = makeResError(error, 500)
//     return res.status(status).json(json)
//   }
// })

query_routerUser.get("/list", (req, res) => {
  return res.status(200).json({
    users: userSteamClientsStorage.listUsers(),
    loginSessions: loginSessions.entries(),
    userLoginSessions: userLoginSessions.entries(),
  })
})
