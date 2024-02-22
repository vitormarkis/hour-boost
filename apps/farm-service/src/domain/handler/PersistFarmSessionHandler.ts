import { PlanRepository, SteamAccountClientStateCacheRepository } from "core"
import { UserCompleteFarmSessionCommand } from "~/application/commands"
import { AllUsersClientsStorage } from "~/application/services"
import { persistUsagesOnDatabase } from "~/application/utils/persistUsagesOnDatabase"
import { EventNames, Observer } from "~/infra/queue"

export class PersistFarmSessionHandler implements Observer {
  operation: EventNames = "user-complete-farm-session"

  constructor(
    private readonly planRepository: PlanRepository,
    private readonly steamAccountClientStateCacheRepository: SteamAccountClientStateCacheRepository,
    private readonly allUsersClientsStorage: AllUsersClientsStorage
  ) {}

  async notify({
    planId,
    pauseFarmCategory,
    when,
    killSession,
    userId,
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
        const sac = this.allUsersClientsStorage.getAccountClient(userId, accountName)
        if (!sac) return Promise.resolve()
        await this.steamAccountClientStateCacheRepository.save(sac.getCache())
      })
      await Promise.all(stopFarmOnCachePromises)
      console.log(`Parando farm no cache nas contas [${accountNameList.join(", ")}]`)
    }
  }
}
