import { CustomPlan, Plan as PrismaPlan, Usage as PrismaUsage } from "@prisma/client"
import {
  ApplicationError,
  CustomInfinityPlan,
  CustomUsagePlan,
  DiamondPlan,
  GoldPlan,
  GuestPlan,
  PlanInfinity,
  PlanInfinityName,
  PlanInfinityRestoreProps,
  PlanUsage,
  PlanUsageName,
  PlanUsageRestoreProps,
  SilverPlan,
  UsageList,
} from "core"
import { databaseUsageToDomain } from "~/infra/mappers/databaseUsageToDomain"

export function makeInfinityPlan(planProps: PlanInfinityRestoreProps & PlanName["INFINITY"]): PlanInfinity {
  if (planProps.name === "DIAMOND") return DiamondPlan.restore(planProps)
  if (planProps.name === "SILVER") return SilverPlan.restore(planProps)
  if (planProps.name === "GOLD") return GoldPlan.restore(planProps)
  console.log(`makeInfinityPlan: Tried to assign this invalid planProps: `, planProps)
  throw new ApplicationError("Invalid plan assignment")
}

export function makeCustomInfinityPlan(plan: PlanInfinity): CustomInfinityPlan {
  return CustomInfinityPlan.fromPlan(plan, plan.price)
}

export function makeCustomUsagePlan(plan: PlanUsage): CustomUsagePlan {
  return CustomUsagePlan.fromPlan(plan, plan.price)
}

export function makeUsagePlan(planProps: PlanUsageRestoreProps & PlanName["USAGE"]): PlanUsage {
  if (planProps.name === "GUEST") return GuestPlan.restore(planProps)
  console.log(`makeUsagePlan: Tried to assign this invalid planProps: `, planProps)
  throw new ApplicationError("Invalid plan assignment")
}

export function getCurrentPlanOrCreateOne(
  dbUserPlan: ((PrismaPlan | CustomPlan) & { usages: PrismaUsage[] }) | null,
  userId: string
) {
  // if (!dbUserPlan) return GuestPlan.create({ ownerId: userId })
  if (!dbUserPlan) throw new Error("db user plan provided is null")
  return databasePlanToDomain(dbUserPlan)
}

type RestoreInfinity = Parameters<typeof CustomInfinityPlan.restore>[0]
type RestoreUsage = Parameters<typeof CustomUsagePlan.restore>[0]
export type CommonKeys<T1, T2> = {
  [K in keyof T1 & keyof T2]: T1[K] & T2[K]
}

export function makeCustomPlan(customPlan: CustomPlan & { usages: PrismaUsage[] }) {
  const commonProps: CommonKeys<RestoreInfinity, RestoreUsage> = {
    id_plan: customPlan.id_plan,
    maxGamesAllowed: customPlan.maxGamesAllowed,
    maxSteamAccounts: customPlan.maxSteamAccounts,
    ownerId: customPlan.ownerId!,
    price: customPlan.priceInCents,
    usages: new UsageList({
      data: customPlan.usages.map(databaseUsageToDomain),
    }),
  }

  switch (customPlan.type) {
    case "INFINITY":
      return CustomInfinityPlan.restore({
        ...commonProps,
        autoRestarter: customPlan.autoRelogin,
      })
    case "USAGE":
      return CustomUsagePlan.restore({
        ...commonProps,
        maxUsageTime: customPlan.maxUsageTime,
      })
    default:
      throw new Error(`Invariant! Restore invalid custom plan with props: [${JSON.stringify(customPlan)}]`)
  }
}

export function databasePlanToDomain(dbUserPlan: (PrismaPlan | CustomPlan) & { usages: PrismaUsage[] }) {
  switch (dbUserPlan.name) {
    case "CUSTOM_INFINITY_PLAN":
    case "CUSTOM_USAGE_PLAN":
      return makeCustomPlan(dbUserPlan)
    case "DIAMOND":
    case "GOLD":
    case "SILVER":
      return makeInfinityPlan({
        id_plan: dbUserPlan.id_plan,
        name: dbUserPlan.name as PlanInfinityName,
        ownerId: dbUserPlan.ownerId!,
        usages: new UsageList(),
      })
    case "GUEST":
      return makeUsagePlan({
        id_plan: dbUserPlan.id_plan,
        name: dbUserPlan.name as PlanUsageName,
        ownerId: dbUserPlan.ownerId!,
        usages: new UsageList({
          data: dbUserPlan.usages.map(databaseUsageToDomain),
        }),
      })

    default:
      throw new ApplicationError("Invalid plan data from database")
  }
}

export type PlanName = {
  USAGE: {
    name: PlanUsageName
  }
  INFINITY: {
    name: PlanInfinityName
  }
}
