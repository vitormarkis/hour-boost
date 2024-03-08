import { Fail, type PlanInfinity, type PlanRepository, type PlanUsage, type Usage } from "core"
import type { PauseFarmOnAccountUsage } from "~/application/services"
import { EAppResults } from "../use-cases"

export async function persistUsagesOnDatabase(
  planId: string,
  pauseFarm: PauseFarmOnAccountUsage,
  planRepository: PlanRepository
) {
  const plan = await planRepository.getById(planId)
  if (!plan)
    return [
      Fail.create(EAppResults["PLAN-NOT-FOUND"], 404, {
        foundPlan: plan,
        givenPlanId: planId,
      }),
    ]
  if (pauseFarm.type == "STOP-ALL") appendUsagesStopAll(plan, pauseFarm.usages)
  else if (pauseFarm.type == "STOP-ONE") appendUsagesStopOne(plan, pauseFarm.usage)
  else if (pauseFarm.type == "STOP-SILENTLY") {
  }
  await planRepository.update(plan)
  return [null, null]
}

function appendUsagesStopAll<TPlan extends PlanUsage | PlanInfinity>(plan: TPlan, usages: Usage[]): TPlan {
  for (const usage of usages) {
    plan.use(usage)
  }
  return plan
}

function appendUsagesStopOne<TPlan extends PlanUsage | PlanInfinity>(plan: TPlan, usage: Usage): TPlan {
  plan.use(usage)
  return plan
}
