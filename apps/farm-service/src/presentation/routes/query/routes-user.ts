import "dotenv/config"

import { ClerkExpressWithAuth, WithAuthProp } from "@clerk/clerk-sdk-node"
import { GetUser } from "core"
import { Request, Response, Router } from "express"

import { CreateUserUseCase } from "~/application/use-cases"
import { GetMeController } from "~/presentation/controllers"
import { promiseHandler } from "~/presentation/controllers/promiseHandler"
import { userAuthentication, usersClusterStorage, usersDAO, usersRepository } from "~/presentation/instances"

export const query_routerUser: Router = Router()
export const createUser = new CreateUserUseCase(usersRepository, userAuthentication, usersClusterStorage)
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
  const { json, status } = await promiseHandler(
    getMeController.handle({
      payload: {
        userId: req.auth.userId,
      },
    })
  )

  return res.status(status).json(json)
})

// ============
export type UserID = string
export type LoginSessionID = string
export type LoginSessionConfig = {
  insertCodeCallback: ((code: string) => void) | null
}
const userLoginSessions: Map<UserID, { loginSessionID: LoginSessionID }> = new Map()
const loginSessions: Map<LoginSessionID, LoginSessionConfig> = new Map()
