import { ApplicationError, DataOrError, PlanInfinity, PlanRepository, PlanUsage, Usage } from "core"
import { PauseFarmOnAccountUsage } from "~/application/services"

export async function persistUsagesOnDatabase(
  planId: string,
  pauseFarm: PauseFarmOnAccountUsage,
  planRepository: PlanRepository
): Promise<DataOrError<null>> {
  const plan = await planRepository.getById(planId)
  if (!plan) return [new ApplicationError(`Plano com id [${planId}] não encontrado.`)]
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
