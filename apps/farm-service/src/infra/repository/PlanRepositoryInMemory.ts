import { PlanInfinity, PlanRepository, PlanUsage } from "core"
import { UsersInMemory } from "~/infra/repository/UsersInMemory"

export class PlanRepositoryInMemory implements PlanRepository {
  constructor(private readonly usersMemory: UsersInMemory) {}

  async getById(planId: string): Promise<PlanUsage | PlanInfinity | null> {
    return this.usersMemory.users.find(user => user.plan.id_plan === planId)?.plan ?? null
  }

  async update(plan: PlanUsage | PlanInfinity): Promise<void> {
    this.usersMemory.users = this.usersMemory.users.map(u => {
      if (u.id_user === plan.ownerId) {
        u.assignPlan(plan)
      }
      return u
    })
  }
}
