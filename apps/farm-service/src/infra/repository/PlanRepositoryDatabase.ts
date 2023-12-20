import { PrismaClient } from "@prisma/client"
import { PlanInfinity, PlanRepository, PlanUsage } from "core"
import { getCurrentPlan } from "~/utils"

export class PlanRepositoryDatabase implements PlanRepository {
  constructor(private readonly prisma: PrismaClient) {}

  list(): Promise<(PlanUsage | PlanInfinity)[]> {
    throw new Error("PlanRepository.list() = Method not implemented.")
  }

  async update(plan: PlanUsage | PlanInfinity): Promise<void> {
    await this.prisma.plan.update({
      where: { id_plan: plan.id_plan },
      data: {
        usages: {
          deleteMany: {
            id_usage: {
              in: plan.usages.getTrashIDs(),
            },
          },
          connectOrCreate: plan.usages.data.map(u => {
            return {
              where: { id_usage: u.id_usage },
              create: {
                amountTime: u.amountTime,
                createdAt: u.createdAt,
                id_usage: u.id_usage,
                accountName: u.accountName,
              },
            }
          }),
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
