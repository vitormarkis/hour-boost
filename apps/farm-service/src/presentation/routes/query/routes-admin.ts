import { Router } from "express"
import { AddMoreGamesToPlanUseCase } from "~/application/use-cases/AddMoreGamesToPlanUseCase"
import { GetUsersAdminListUseCase } from "~/application/use-cases/GetUsersAdminListUseCase"
import { ensureAdmin } from "~/inline-middlewares/ensureAdmin"
import { usersDAO } from "~/presentation/instances"

export const query_routerAdmin: Router = Router()

const getUsersAdminListUseCase = new GetUsersAdminListUseCase(usersDAO)
query_routerAdmin.get("/users-list", async function (req, res) {
  const [noAdminRole] = await ensureAdmin(req, res)
  if (noAdminRole) return res.status(noAdminRole.status).json(noAdminRole.json)

  const [error, usersAdminList] = await getUsersAdminListUseCase.execute({})

  return res.json({ usersAdminList, code: "SUCCESS" })
})

// @ts-ignore
const addMoreGamesToPlanUseCase = new AddMoreGamesToPlanUseCase()
query_routerAdmin.get("/users-list", async function (req, res) {
  const [noAdminRole] = await ensureAdmin(req, res)
  if (noAdminRole) return res.status(noAdminRole.status).json(noAdminRole.json)

  // @ts-ignore TODO
  const [error, usersAdminList] = await addMoreGamesToPlanUseCase.execute({})

  return res.json({ usersAdminList, code: "SUCCESS" })
})
