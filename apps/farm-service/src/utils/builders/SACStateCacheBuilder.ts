import { type AppAccountStatus, SACStateCache } from "core"
import type { Builder } from "~/utils/builders/builder.interface"
import type { Pretify } from "~/utils/helpers"

export type StateCachePayloadSAC = {
  gamesPlaying: number[]
  gamesStaging: number[]
  accountName: string
  planId: string
  username: string
  status: AppAccountStatus
}
export type StateCachePayloadFarmService = {
  farmStartedAt: Date | null
}

type Payload = Pretify<StateCachePayloadSAC & StateCachePayloadFarmService>

export class SACStateCacheBuilder implements Builder<SACStateCache> {
  create(props: Payload): SACStateCache {
    return new SACStateCache(
      props.gamesPlaying,
      props.gamesStaging,
      props.accountName,
      props.planId,
      props.username,
      props.farmStartedAt,
      props.status
    )
  }
}
