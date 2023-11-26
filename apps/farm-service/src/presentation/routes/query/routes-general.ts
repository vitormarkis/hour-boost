import { ClerkExpressWithAuth, WithAuthProp } from "@clerk/clerk-sdk-node"
import { CreateUser, GetUser } from "core"
import { Request, Response, Router } from "express"
import { GetMeController } from "~/presentation/controllers"
import {
  farmingUsersStorage,
  userSteamClientsStorage,
  userAuthentication,
  usersDAO,
  usersRepository,
} from "~/presentation/instances"

export const query_routerGeneral: Router = Router()

const createUser = new CreateUser(usersRepository, userAuthentication)
const getUser = new GetUser(usersDAO)

query_routerGeneral.get("/up", (req, res) => {
  return res.status(200).json({
    message: "Server is up!",
  })
})

query_routerGeneral.get("/list", (req, res) => {
  return res.status(200).json({
    users: userSteamClientsStorage.listUsers(),
  })
})
