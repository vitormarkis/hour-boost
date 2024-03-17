import { Router } from "express"
import { z } from "zod"
import { AddMoreGamesToPlanUseCase } from "~/application/use-cases/AddMoreGamesToPlanUseCase"
import { GetUsersAdminListUseCase } from "~/application/use-cases/GetUsersAdminListUseCase"
import { ensureAdmin } from "~/inline-middlewares/ensureAdmin"
import { validateBody } from "~/inline-middlewares/validate-payload"
import {
  allUsersClientsStorage,
  changeUserPlanToCustomUseCase,
  changeUserPlanUseCase,
  planRepository,
  steamAccountClientStateCacheRepository,
  usersClusterStorage,
  usersDAO,
  usersRepository,
} from "~/presentation/instances"

export const query_routerAdmin: Router = Router()

const getUsersAdminListUseCase = new GetUsersAdminListUseCase(usersDAO)
query_routerAdmin.get("/users-list", async (req, res) => {
  const [noAdminRole] = await ensureAdmin(req, res)
  if (noAdminRole) return res.status(noAdminRole.status).json(noAdminRole.json)

  const [error, usersAdminList] = await getUsersAdminListUseCase.execute({})

  return res.json({ usersAdminList, code: "SUCCESS" })
})

const addMoreGamesToPlanUseCase = new AddMoreGamesToPlanUseCase(
  usersRepository,
  changeUserPlanToCustomUseCase,
  allUsersClientsStorage,
  usersClusterStorage,
  steamAccountClientStateCacheRepository,
  planRepository
)

query_routerAdmin.post("/add-more-games", async (req, res) => {
  const [noAdminRole] = await ensureAdmin(req, res)
  if (noAdminRole) return res.status(noAdminRole.status).json(noAdminRole.json)

  const [invalidBody, body] = validateBody(
    req.body,
    z.object({
      newMaxGamesAllowed: z.number().positive(),
      mutatingUserId: z.string().min(1),
    })
  )
  if (invalidBody) return res.status(invalidBody.status).json(invalidBody.json)
  const { newMaxGamesAllowed, mutatingUserId } = body

  const [error, usersAdminList] = await addMoreGamesToPlanUseCase.execute({
    newMaxGamesAllowed,
    mutatingUserId,
  })

  if (error) {
    if ("code" in error) {
      switch (error.code) {
        case "LIST::TRIMMING-ACCOUNTS":
        case "LIST::UPDATING-CACHE":
        case "USER-NOT-FOUND":
        case "USER-STORAGE-NOT-FOUND":
          return console.log({ error })
        case "LIST:ERROR-RESETING-FARM":
          return console.log(error.payload)
        default:
          error satisfies never
      }
    }
    error satisfies never
  }

  return res.json({ usersAdminList, code: "SUCCESS" })
})

query_routerAdmin.post("/change-user-plan", async (req, res) => {
  const { secret } = req.body
  if (secret !== process.env.ACTIONS_SECRET) {
    return res.status(500).json({ message: "Unauthorized. :)" })
  }

  const [invalidBody, body] = validateBody(
    req.body,
    z.object({
      newPlanName: z.enum(["DIAMOND", "GOLD", "GUEST", "SILVER", "INFINITY-CUSTOM", "USAGE-CUSTOM"]),
      userId: z.string().min(1),
    })
  )
  if (invalidBody) return res.status(invalidBody.status).json(invalidBody.json)
  const { newPlanName, userId } = body

  const user = await usersRepository.getByID(userId)
  const [error, response] = await changeUserPlanUseCase.execute({
    newPlanName,
    user: user!,
  })

  return res.status(200).json(error ?? "sucesso")
})