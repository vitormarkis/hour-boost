import { Router } from "express"
import { z } from "zod"
import { AddMoreGamesToPlanUseCase } from "~/application/use-cases/AddMoreGamesToPlanUseCase"
import { GetUsersAdminListUseCase } from "~/application/use-cases/GetUsersAdminListUseCase"
import { ensureAdmin } from "~/inline-middlewares/ensureAdmin"
import { validateBody } from "~/inline-middlewares/validate-payload"
import { changeUserPlanToCustomUseCase, usersDAO, usersRepository } from "~/presentation/instances"

export const query_routerAdmin: Router = Router()

const getUsersAdminListUseCase = new GetUsersAdminListUseCase(usersDAO)
query_routerAdmin.get("/users-list", async function (req, res) {
  const [noAdminRole] = await ensureAdmin(req, res)
  if (noAdminRole) return res.status(noAdminRole.status).json(noAdminRole.json)

  const [error, usersAdminList] = await getUsersAdminListUseCase.execute({})

  return res.json({ usersAdminList, code: "SUCCESS" })
})

const addMoreGamesToPlanUseCase = new AddMoreGamesToPlanUseCase(
  usersRepository,
  changeUserPlanToCustomUseCase
)

query_routerAdmin.post("/add-more-games", async function (req, res) {
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
    switch (error.code) {
      case "LIST::TRIMMING-ACCOUNTS":
      case "LIST::UPDATING-CACHE":
      case "SOME-USER-ACCOUNTS-DO-NOT-HAVE-SAC-IN-MEMORY":
      case "USER-NOT-FOUND":
      case "USER-STORAGE-NOT-FOUND":
        return console.log({ error })
      default:
        error satisfies never
    }
  }

  return res.json({ usersAdminList, code: "SUCCESS" })
})
