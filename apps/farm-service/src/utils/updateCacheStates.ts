import { CacheState, PlanInfinity, PlanUsage } from "core"

type UpdateCacheStatesProps = {
  plan: PlanInfinity | PlanUsage
  currentSACStates: CacheState[]
}

export function updateCacheStates({ currentSACStates, plan }: UpdateCacheStatesProps) {
  const newStates = currentSACStates.map(state => {
    return CacheState.restore({
      accountName: state.accountName,
      farmStartedAt: state.farmStartedAt,
      gamesPlaying: state.gamesPlaying.slice(0, plan.maxGamesAllowed),
      gamesStaging: state.gamesStaging.slice(0, plan.maxGamesAllowed),
      planId: state.planId,
      status: state.status,
      username: state.username,
    })
  })
  return newStates
}
