import { ClerkExpressWithAuth, WithAuthProp } from "@clerk/clerk-sdk-node"
import { CreateUser, GetUser } from "core"
import { Request, Response, Router } from "express"
import { GetMeController } from "~/presentation/controllers"
import { farmingUsersStorage, steamFarming, userAuthentication, usersDAO, usersRepository } from "~/presentation/instances"

export const query_routerGeneral: Router = Router()

const createUser = new CreateUser(usersRepository, userAuthentication)
const getUser = new GetUser(usersDAO)

query_routerGeneral.get("/up", (req, res) => {
  console.log({
    farmingUsers: farmingUsersStorage.listFarmingStatusCount(),
    date: new Date(),
  })

  return res.status(200).json({
    message: "server is up !",
  })
})

query_routerGeneral.get("/me", ClerkExpressWithAuth(), async (req: WithAuthProp<Request>, res: Response) => {
  const getMeController = new GetMeController(usersRepository, createUser, getUser)
  const { json, status } = await getMeController.handle({
    payload: {
      userId: req.auth.userId,
    },
  })

  return res.status(status).json(json)
})

query_routerGeneral.get("/list", (req, res) => {
  return res.status(200).json({
    users: steamFarming.listUsers(),
  })
})
