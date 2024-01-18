import { PlanInfinitySession, PlanUsageSession } from "core"

export function thisPlanIsUsage(plan: PlanUsageSession | PlanInfinitySession): plan is PlanUsageSession {
  return "maxUsageTime" in plan
}
