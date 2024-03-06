import { CacheState, PlanInfinity, PlanUsage } from "core"

type Limitations = {
  maxGamesAllowed: number
}

type UpdateCacheStatesProps = {
  limitations: Limitations
  currentSACStates: CacheState[]
}

export function updateCacheStates({ currentSACStates, limitations }: UpdateCacheStatesProps) {
  return currentSACStates.map(updateCacheState(limitations))
}
export function updateCacheState(limitations: Limitations) {
  return (state: CacheState) =>
    CacheState.restore({
      accountName: state.accountName,
      farmStartedAt: state.farmStartedAt,
      gamesPlaying: state.gamesPlaying.slice(0, limitations.maxGamesAllowed),
      gamesStaging: state.gamesStaging.slice(0, limitations.maxGamesAllowed),
      planId: state.planId,
      status: state.status,
      username: state.username,
    })
}
