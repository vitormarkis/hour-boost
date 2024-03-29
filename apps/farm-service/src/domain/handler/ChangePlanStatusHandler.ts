import { type PlanRepository, PlanUsage } from "core"

import type { UserHasStartFarmingCommand } from "~/application/commands"
import type { EventNames, Observer } from "~/infra/queue"

export class ChangePlanStatusHandler implements Observer {
  operation: EventNames = "user-has-start-farming"

  constructor(private readonly planRepository: PlanRepository) {}

  async notify(command: UserHasStartFarmingCommand): Promise<void> {
    const actualPlan = await this.planRepository.getById(command.planId)
    if (actualPlan instanceof PlanUsage) {
      actualPlan.startFarm()
      await this.planRepository.update(actualPlan)
    }
  }
}
