import { PlanInfinity, PlanRepository, PlanUsage } from "core"
import { UserCompletedFarmSessionInfinityCommand } from "~/application/commands/UserCompletedFarmSessionInfinityCommand"
import { getUsageAmountTimeFromDateRange } from "~/domain/utils/getUsageAmountTimeFromDateRange"
import { EventNames, Observer } from "~/infra/queue"
import { UsageBuilder } from "~/utils/builders/UsageBuilder"

export class PersistFarmSessionInfinityHandler implements Observer {
  operation: EventNames = "user-complete-farm-session-infinity"

  constructor(
    private readonly planRepository: PlanRepository,
    private readonly usageBuilder: UsageBuilder
  ) {}

  async notify({
    accountName,
    startedAt,
    when,
    planId,
  }: UserCompletedFarmSessionInfinityCommand): Promise<void> {
    const plan = await this.planRepository.getById(planId)
    const amountTime = getUsageAmountTimeFromDateRange(startedAt, when)
    const usage = this.usageBuilder.create({
      accountName,
      amountTime,
      createdAt: when,
      plan_id: planId,
    })
    if (plan && plan instanceof PlanInfinity) {
      plan.use(usage)
      await this.planRepository.update(plan)
    }
  }
}
