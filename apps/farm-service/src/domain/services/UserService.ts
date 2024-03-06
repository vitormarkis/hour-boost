import { CacheState, PlanInfinity, PlanUsage, User } from "core"
import { only } from "~/utils/helpers"
import { updateCacheStates } from "~/utils/updateCacheStates"

export class UserService {
  changePlan(user: User, newPlan: PlanInfinity | PlanUsage, currentSACStates: CacheState[]) {
    const updatedCacheStates: CacheState[] = updateCacheStates({
      limitations: {
        maxGamesAllowed: newPlan.maxGamesAllowed
      },
      currentSACStates: currentSACStates,
    })
    user.assignPlan(newPlan)

    return only({ updatedCacheStates })
  }
}
