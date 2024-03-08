import type { $Enums, } from "@prisma/client"
import {
  type 
  PlanInfinitySession,
  PlanUsage,
  type 
  PlanUsageSession,
} from "core"
import { databasePlanToDomain } from "~/infra/mappers/databasePlanToDomain"

type DBPlan = {
  id_plan: string
  createdAt: Date
  name: $Enums.PlanName
  ownerId: string | null
  type: $Enums.PlanType
}

type DBCustomPlan = {
  id_plan: string
  createdAt: Date
  name: $Enums.PlanNameCustom
  ownerId: string | null
  type: $Enums.PlanType
  maxSteamAccounts: number
  maxGamesAllowed: number
  maxUsageTime: number
  priceInCents: number
  autoRelogin: boolean
}

type Usages = {
  usages: {
    id_usage: string
    createdAt: Date
    amountTime: number
    plan_id: string | null
    custom_plan_id: string | null
    user_id: string
    accountName: string
  }[]
}

export function databasePlanToSession(
  plan: (DBPlan | DBCustomPlan) & Usages,
  farmUsedTime: number
): PlanUsageSession | PlanInfinitySession {
  if (!plan) throw new Error("Plan does not exists.")
  const domainPlan = databasePlanToDomain(plan)
  if (domainPlan instanceof PlanUsage) {
    const usagePlan: PlanUsageSession = {
      autoRestarter: domainPlan.autoRestarter,
      farmUsedTime,
      id_plan: domainPlan.id_plan,
      maxGamesAllowed: domainPlan.maxGamesAllowed,
      maxSteamAccounts: domainPlan.maxSteamAccounts,
      maxUsageTime: domainPlan.maxUsageTime,
      name: domainPlan.name,
      type: "USAGE",
    }
    return usagePlan
  } else {
    const infinityPlan: PlanInfinitySession = {
      autoRestarter: domainPlan.autoRestarter,
      id_plan: domainPlan.id_plan,
      maxGamesAllowed: domainPlan.maxGamesAllowed,
      maxSteamAccounts: domainPlan.maxSteamAccounts,
      name: domainPlan.name,
      type: "INFINITY",
    }
    return infinityPlan
  }
}

// export function databaseCustomPlanToSession(
//   customPlan: DBCustomPlan
// ): PlanUsageSession | PlanInfinitySession {
//   const customPlanUsageSession: PlanUsageSession = {
//     autoRestarter,
//     farmUsedTime,
//     id_plan,
//     maxGamesAllowed,
//     maxSteamAccounts,
//     maxUsageTime,
//     name,
//     type,
//   }

//   return customPlanUsageSession
// }
