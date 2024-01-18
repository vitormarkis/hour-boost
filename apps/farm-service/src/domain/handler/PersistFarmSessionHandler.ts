import { PlanRepository, SteamAccountClientStateCacheRepository } from "core"
import { UserCompleteFarmSessionCommand } from "~/application/commands"
import { persistUsagesOnDatabase } from "~/application/utils/persistUsagesOnDatabase"
import { EventNames, Observer } from "~/infra/queue"

export class PersistFarmSessionHandler implements Observer {
  operation: EventNames = "user-complete-farm-session"

  constructor(
    private readonly planRepository: PlanRepository,
    private readonly steamAccountClientStateCacheRepository: SteamAccountClientStateCacheRepository
  ) {}

  async notify({
    planId,
    pauseFarmCategory,
    when,
    killSession,
  }: UserCompleteFarmSessionCommand): Promise<void> {
    const [errorPersistingUsages] = await persistUsagesOnDatabase(
      planId,
      pauseFarmCategory,
      this.planRepository
    )
    if (errorPersistingUsages) {
      return console.log(`[${when.toISOString()}]: Error persisting usages: `, pauseFarmCategory)
    }
    if (killSession) {
      const accountNameList =
        pauseFarmCategory.type === "STOP-ALL"
          ? pauseFarmCategory.accountNameList
          : [pauseFarmCategory.accountName]
      const stopFarmOnCachePromises = accountNameList.map(async accountName => {
        await this.steamAccountClientStateCacheRepository.stopFarm(accountName)
      })
      await Promise.all(stopFarmOnCachePromises)
      console.log(`Parando farm no cache nas contas [${accountNameList.join(", ")}]`)
    }
  }
}
