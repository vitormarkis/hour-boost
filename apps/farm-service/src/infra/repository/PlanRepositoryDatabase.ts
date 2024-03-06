import { PrismaClient } from "@prisma/client"
import { PlanInfinity, PlanRepository, PlanUsage } from "core"
import { databasePlanToDomain } from "~/infra/mappers/databasePlanToDomain"

export class PlanRepositoryDatabase implements PlanRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getByUserId(userId: string): Promise<PlanUsage | PlanInfinity | null> {
    const plan = await this.prisma.plan.findUnique({
      where: { ownerId: userId },
      include: { usages: true },
    })

    if (plan) return databasePlanToDomain(plan)

    const customPlan = await this.prisma.customPlan.findUnique({
      where: { ownerId: userId },
      include: { usages: true },
    })

    return customPlan ? databasePlanToDomain(customPlan) : null
  }

  async list(): Promise<(PlanUsage | PlanInfinity)[]> {
    console.log("NSTH: PlanRepository.list() = Method not implemented.")
    return [] as (PlanUsage | PlanInfinity)[]
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
    const plan = await this.prisma.plan.findUnique({
      where: { id_plan: planId },
      include: { usages: true },
    })

    if (plan) return databasePlanToDomain(plan)

    const customPlan = await this.prisma.customPlan.findUnique({
      where: { id_plan: planId },
      include: { usages: true },
    })

    return customPlan ? databasePlanToDomain(customPlan) : null
  }
}
