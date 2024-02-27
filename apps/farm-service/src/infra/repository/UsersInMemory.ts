import { PlanInfinity, PlanUsage, User } from "core"

export class UsersInMemory {
  users: User[] = []

  dropAll() {
    this.users = []
  }

  dropAllSteamAccounts() {
    for (const user of this.users) {
      user.steamAccounts.deleteAll()
    }
  }

  assignPlan(plan: PlanInfinity | PlanUsage) {
    for (const user of this.users) {
      if (user.id_user !== plan.ownerId) continue
      user.assignPlan(plan)
      plan.usages.data.forEach(usage => {
        console.log(`adding usage with ${usage.amountTime} seconds to user ${user.username}`)
        user.usages.add(usage)
      })
      console.log({
        userPlanUsages: user.plan.usages.data.map(u => u.id_usage),
        userUsages: user.usages.data.map(u => u.id_usage),
      })
    }
  }
}
