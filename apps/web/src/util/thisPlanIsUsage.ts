import { PlanInfinitySession, PlanUsageSession } from "core"

export function planIsUsage(plan: PlanUsageSession | PlanInfinitySession): plan is PlanUsageSession {
  return "maxUsageTime" in plan
}
