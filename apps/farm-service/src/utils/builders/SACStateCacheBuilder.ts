import { AppAccountStatus, SACStateCache } from "core"
import { Builder } from "~/utils/builders/builder.interface"
import { Prettify } from "~/utils/helpers"

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

type Payload = Prettify<StateCachePayloadSAC & StateCachePayloadFarmService>

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
