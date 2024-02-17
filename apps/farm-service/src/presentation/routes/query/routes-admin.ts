import { Router } from "express"
import { ensureAdmin } from "~/inline-middlewares/ensureAdmin"

export const query_routerAdmin: Router = Router()

query_routerAdmin.get("/users-list", async function (req, res) {
  const [noAdminRole] = await ensureAdmin(req, res)
  if (noAdminRole) return res.status(noAdminRole.status).json(noAdminRole.json)

  
  
  return res.json({ ok: true })
})
