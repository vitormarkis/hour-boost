import { PlanRepository, PlanUsage } from "core"

import { UserCompleteFarmSessionCommand } from "~/application/commands"
import { EventNames, Observer } from "~/infra/queue"

export class PersistUsageHandler implements Observer {
  operation: EventNames = "user-complete-farm-session"

  constructor(private readonly planRepository: PlanRepository) {}

  async notify(command: UserCompleteFarmSessionCommand): Promise<void> {
    const actualPlan = await this.planRepository.getById(command.planId)
    if (actualPlan instanceof PlanUsage) {
      console.log({
        usage: command.usage,
      })
      actualPlan.use(command.usage)
      actualPlan.stopFarm()
      await this.planRepository.update(actualPlan)
    }
  }
}
