import { CacheState, PlanInfinity, PlanUsage } from "core"

type UpdateCacheStatesProps = {
  plan: PlanUsage | PlanInfinity
  currentSACStates: CacheState[]
}

export function updateCacheStates({ currentSACStates, plan }: UpdateCacheStatesProps) {
  return currentSACStates.map(updateCacheState(plan))
}
export function updateCacheState(plan: PlanUsage | PlanInfinity) {
  return (state: CacheState) =>
    CacheState.restore({
      accountName: state.accountName,
      farmStartedAt: state.farmStartedAt,
      gamesPlaying: state.gamesPlaying.slice(0, plan.maxGamesAllowed),
      gamesStaging: state.gamesStaging.slice(0, plan.maxGamesAllowed),
      planId: plan.id_plan,
      status: state.status,
      username: state.username,
    })
}
