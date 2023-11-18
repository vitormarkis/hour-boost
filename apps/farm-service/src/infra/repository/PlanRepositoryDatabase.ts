import { Prisma, PrismaClient } from "@prisma/client"
import { Plan, PlanInfinity, PlanRepository, PlanUsage } from "core"
import { getCurrentPlan } from "~/utils"

export class PlanRepositoryDatabase implements PlanRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async update(plan: PlanUsage | PlanInfinity): Promise<void> {
    console.log("DATABASE: Salvando plano novo")

    await this.prisma.plan.update({
      where: { id_plan: plan.id_plan },
      data: {
        usages:
          plan instanceof PlanUsage
            ? {
                connectOrCreate: plan.usages.map(u => {
                  return {
                    where: { id_usage: u.id_usage },
                    create: {
                      amountTime: u.amountTime,
                      createdAt: u.createdAt,
                      id_usage: u.id_usage,
                    },
                  }
                }),
              }
            : {
                set: [],
              },
      },
    })
  }

  async getById(planId: string): Promise<PlanUsage | PlanInfinity | null> {
    const dbPlan = await this.prisma.plan.findUnique({
      where: { id_plan: planId },
      include: { usages: true },
    })

    return dbPlan ? getCurrentPlan(dbPlan) : null
  }
}
