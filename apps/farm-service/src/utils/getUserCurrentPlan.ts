import { Plan as PrismaPlan, Usage as PrismaUsage } from "@prisma/client"
import {
  GuestPlan,
  PlanInfinityName,
  PlanUsage,
  PlanUsageName,
  PlanInfinity,
  DiamondPlan,
  PlanInfinityRestoreProps,
  SilverPlan,
  GoldPlan,
  PlanUsageRestoreProps,
  Plan,
  Usage,
  ApplicationError,
} from "core"

export function makeInfinityPlan(planProps: PlanInfinityRestoreProps & PlanName["INFINITY"]): PlanInfinity {
  if (planProps.name === "DIAMOND") return DiamondPlan.restore(planProps)
  if (planProps.name === "SILVER") return SilverPlan.restore(planProps)
  if (planProps.name === "GOLD") return GoldPlan.restore(planProps)
  console.log(`makeInfinityPlan: Tried to assign this invalid planProps: `, planProps)
  throw new ApplicationError("Invalid plan assignment")
}

export function makeUsagePlan(planProps: PlanUsageRestoreProps & PlanName["USAGE"]): PlanUsage {
  if (planProps.name === "GUEST") return GuestPlan.restore(planProps)
  console.log(`makeUsagePlan: Tried to assign this invalid planProps: `, planProps)
  throw new ApplicationError("Invalid plan assignment")
}

type SessionPlan = PrismaPlan & { usages: PrismaUsage[] }

export function getCurrentPlanOrCreateOne(dbUserPlan: SessionPlan | null, userId: string) {
  if (!dbUserPlan) return GuestPlan.create({ ownerId: userId })
  return getCurrentPlan(dbUserPlan)
}

export function getCurrentPlan(dbUserPlan: SessionPlan) {
  if (dbUserPlan.type === "INFINITY")
    return makeInfinityPlan({
      id_plan: dbUserPlan.id_plan,
      name: dbUserPlan.name as PlanInfinityName,
      ownerId: dbUserPlan.ownerId,
    })

  if (dbUserPlan.type === "USAGE")
    return makeUsagePlan({
      id_plan: dbUserPlan.id_plan,
      name: dbUserPlan.name as PlanUsageName,
      ownerId: dbUserPlan.ownerId,
      usages: dbUserPlan.usages.map(u =>
        Usage.restore({
          amountTime: u.amountTime,
          createdAt: u.createdAt,
          id_usage: u.id_usage,
          plan_id: u.plan_id,
        })
      ),
    })
  console.log({ dbUserPlan })
  throw new ApplicationError("Invalid plan data from database")
}

export type PlanName = {
  USAGE: {
    name: PlanUsageName
  }
  INFINITY: {
    name: PlanInfinityName
  }
}
