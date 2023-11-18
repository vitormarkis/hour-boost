import { PlanRepository, PlanUsage } from "core"
import { PlanUsageExpiredMidFarmCommand } from "~/application/commands/PlanUsageExpiredMidFarmCommand"
import { EventNames, Observer } from "~/infra/queue"

export class PersistFarmSessionHandler implements Observer {
  operation: EventNames = "plan-usage-expired-mid-farm"

  constructor(private readonly planRepository: PlanRepository) {}

  async notify(command: PlanUsageExpiredMidFarmCommand): Promise<void> {
    const plan = await this.planRepository.getById(command.planId)
    if (plan instanceof PlanUsage) {
      plan.use(command.usage)
      console.log({ usages: plan.usages })
      await this.planRepository.update(plan)
    }
  }
}
