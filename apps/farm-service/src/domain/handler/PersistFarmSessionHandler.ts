import { PlanRepository } from "core"
import { UserCompleteFarmSessionCommand } from "~/application/commands"
import { persistUsagesOnDatabase } from "~/application/utils/persistUsagesOnDatabase"
import { EventNames, Observer } from "~/infra/queue"

export class PersistFarmSessionHandler implements Observer {
  operation: EventNames = "user-complete-farm-session"

  constructor(private readonly planRepository: PlanRepository) {}

  async notify({ planId, pauseFarmCategory, when }: UserCompleteFarmSessionCommand): Promise<void> {
    const [errorPersistingUsages] = await persistUsagesOnDatabase(
      planId,
      pauseFarmCategory,
      this.planRepository
    )
    if (errorPersistingUsages)
      return console.log(`[${when.toISOString()}]: Error persisting usages: `, pauseFarmCategory)
  }
}
