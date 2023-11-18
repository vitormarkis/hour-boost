import { PlanInfinity } from "core"
import { Router } from "express"
import { usersRepository } from "~/presentation/instances"

export const query_routerPlan: Router = Router()

query_routerPlan.get("/farm/plan-status", async (req, res) => {
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
        usages: user.plan.usages.length,
      },
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      message: "Erro interno no servidor.",
    })
  }
})
