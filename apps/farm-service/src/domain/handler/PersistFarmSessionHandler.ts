import { PlanRepository, PlanUsage } from "core"
import { FarmSessionExpiredMidFarmCommand } from "~/application/commands/PlanUsageExpiredMidFarmCommand"
import { EventNames, Observer } from "~/infra/queue"

export class PersistFarmSessionExpiredMidFarmHandler implements Observer {
  operation: EventNames = "plan-usage-expired-mid-farm"

  constructor(private readonly planRepository: PlanRepository) {}

  async notify(command: FarmSessionExpiredMidFarmCommand): Promise<void> {
    const plan = await this.planRepository.getById(command.planId)
    if (plan instanceof PlanUsage) {
      plan.stopFarm()
      const persistPromises = command.usages.map(usage => {
        plan.use(usage)
        return this.planRepository.update(plan)
      })

      await Promise.all(persistPromises)
    }
  }
}
