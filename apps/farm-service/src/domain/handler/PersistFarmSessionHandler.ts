import { PlanRepository, PlanUsage, Usage } from "core"
import { Command } from "~/application/commands"
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

export type PlanUsageExpiredMidFarmCommand = {
  operation: "plan-usage-expired-mid-farm"
  usage: Usage
  planId: string
  userId: string
}

export type PlanUsageCompleteFarm = {
  operation: "plan-usage-expired-mid-farm"
  usage: Usage
  planId: string
  userId: string
}
