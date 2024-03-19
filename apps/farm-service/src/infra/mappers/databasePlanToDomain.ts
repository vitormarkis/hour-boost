import {
  ApplicationError,
  DiamondPlan,
  GoldPlan,
  GuestPlan,
  PlanInfinity,
  PlanInfinityName,
  PlanInfinityRestoreFromCustomProps,
  PlanInfinityRestoreProps,
  PlanUsage,
  PlanUsageName,
  PlanUsageRestoreFromCustomProps,
  PlanUsageRestoreProps,
  SilverPlan,
  makeError,
} from "core"
import { databaseUsageListToDomain } from "~/infra/mappers/databaseUsageToDomain"
import { PrismaPlan } from "~/infra/repository"

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

export type CommonKeys<T1, T2> = {
  [K in keyof T1 & keyof T2]: T1[K] & T2[K]
}

export function databasePlanToDomain(plan: PrismaPlan): PlanUsage | PlanInfinity {
  if (!plan) throw makeError("Usuário sem plano!", { plan })
  if (!plan.ownerId) throw makeError("Plano sem dono", { plan })
  if (plan.customPlan) {
    const restoreFromCustomInfinityProps: PlanInfinityRestoreFromCustomProps = {
      autoRestarter: plan.customPlan.autoRelogin,
      id_plan: plan.id_plan,
      maxGamesAllowed: plan.customPlan.maxGamesAllowed,
      maxSteamAccounts: plan.customPlan.maxSteamAccounts,
      price: plan.customPlan.priceInCents,
      ownerId: plan.ownerId,
      usages: databaseUsageListToDomain(plan.usages),
    }
    const restoreFromCustomUsageProps: PlanUsageRestoreFromCustomProps = {
      autoRestarter: plan.customPlan.autoRelogin,
      id_plan: plan.id_plan,
      maxGamesAllowed: plan.customPlan.maxGamesAllowed,
      maxSteamAccounts: plan.customPlan.maxSteamAccounts,
      maxUsageTime: plan.customPlan.maxUsageTime,
      price: plan.customPlan.priceInCents,
      ownerId: plan.ownerId,
      usages: databaseUsageListToDomain(plan.usages),
    }
    switch (plan.name) {
      case "DIAMOND":
        return DiamondPlan.restoreFromCustom(restoreFromCustomInfinityProps)
      case "GOLD":
        return GoldPlan.restoreFromCustom(restoreFromCustomInfinityProps)
      case "SILVER":
        return SilverPlan.restoreFromCustom(restoreFromCustomInfinityProps)
      case "GUEST":
        return GuestPlan.restoreFromCustom(restoreFromCustomUsageProps)
      default:
        plan.name satisfies never
    }
  }

  const restoreInfinityProps: PlanInfinityRestoreProps = {
    id_plan: plan.id_plan,
    ownerId: plan.ownerId,
    usages: databaseUsageListToDomain(plan.usages),
  }

  const restoreUsageProps: PlanUsageRestoreProps = {
    id_plan: plan.id_plan,
    ownerId: plan.ownerId,
    usages: databaseUsageListToDomain(plan.usages),
  }
  switch (plan.name) {
    case "DIAMOND":
      return DiamondPlan.restore(restoreInfinityProps)
    case "GOLD":
      return GoldPlan.restore(restoreInfinityProps)
    case "SILVER":
      return SilverPlan.restore(restoreInfinityProps)
    case "GUEST":
      return GuestPlan.restore(restoreUsageProps)
    default:
      plan.name satisfies never

      throw makeError("Caso impossível!", { plan })
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
