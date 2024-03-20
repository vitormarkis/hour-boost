import { PlanInfinity, PlanInfinitySession, PlanUsage, PlanUsageSession, Usage } from "core"

export function domainPlanToSession(plan: PlanUsage | PlanInfinity): PlanUsageSession | PlanInfinitySession {
  if (!plan) throw new Error("Plan does not exists.")
  const farmUsedTime = getFarmUsedTime(plan.usages.data)
  if (plan instanceof PlanUsage) {
    const usagePlan: PlanUsageSession = {
      autoRestarter: plan.autoRestarter,
      farmUsedTime,
      id_plan: plan.id_plan,
      maxGamesAllowed: plan.maxGamesAllowed,
      maxSteamAccounts: plan.maxSteamAccounts,
      maxUsageTime: plan.maxUsageTime,
      name: plan.name,
      type: "USAGE",
      custom: plan.custom,
    }
    return usagePlan
  } else {
    const infinityPlan: PlanInfinitySession = {
      autoRestarter: plan.autoRestarter,
      id_plan: plan.id_plan,
      maxGamesAllowed: plan.maxGamesAllowed,
      maxSteamAccounts: plan.maxSteamAccounts,
      name: plan.name,
      type: "INFINITY",
      custom: plan.custom,
    }
    return infinityPlan
  }
}

function getFarmUsedTime(usages: Usage[] | null) {
  return usages
    ? usages.reduce((acc, item) => {
        return acc + item.amountTime
      }, 0)
    : 0
}
