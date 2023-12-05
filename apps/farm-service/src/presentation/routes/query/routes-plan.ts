import { ApplicationError, PlanInfinity } from "core"
import { Router } from "express"
import { HttpClient } from "~/contracts"
import { promiseHandler } from "~/presentation/controllers/promiseHandler"
import { usersRepository } from "~/presentation/instances"

export const query_routerPlan: Router = Router()

query_routerPlan.get("/farm/plan-status", async (req, res) => {
  const perform = async (): Promise<HttpClient.Response> => {
    const user = await usersRepository.getByID(req.body.userId)
    if (!user) throw new ApplicationError("Usuário não existe.", 404)

    if (user.plan instanceof PlanInfinity) {
      return { json: { plan: { ...user.plan } }, status: 200 }
    }

    return {
      json: {
        plan: {
          ...user.plan,
          timeLeftHours: `${user.plan.getUsageLeft() / 60 / 60} horas`,
          timeLeft: user.plan.getUsageLeft(),
          usageTotalMinutes: `${user.plan.getUsageTotal() / 60} minutos`,
          usageTotal: user.plan.getUsageTotal(),
          usages: user.plan.usages.data.length,
        },
      },
      status: 200,
    }
  }

  const { status, json } = await promiseHandler(perform())
  return res.status(status).json(json)
})
