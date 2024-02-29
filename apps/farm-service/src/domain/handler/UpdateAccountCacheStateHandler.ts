import { CacheState, SteamAccountClientStateCacheRepository } from "core"

import { PlanMaxUsageExceededCommand } from "~/application/commands/PlanMaxUsageExceededCommand"
import { EventNames, Observer } from "~/infra/queue"

export class UpdateAccountCacheStateHandler implements Observer {
  operation: EventNames = "PLAN-MAX-USAGE-EXCEEDED"

  constructor(private readonly sacStateCacheRepository: SteamAccountClientStateCacheRepository) {}

  async notify({ state }: PlanMaxUsageExceededCommand): Promise<void> {
    await this.sacStateCacheRepository.save(CacheState.restoreFromDTO(state))
  }
}
