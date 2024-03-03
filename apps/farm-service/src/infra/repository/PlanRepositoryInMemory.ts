import { PlanInfinity, PlanRepository, PlanUsage } from "core"
import { UsersInMemory } from "./UsersInMemory"

export class PlanRepositoryInMemory implements PlanRepository {
  constructor(private readonly usersMemory: UsersInMemory) {}

  async getByUserId(userId: string): Promise<PlanUsage | PlanInfinity | null> {
    return this.usersMemory.users.find(user => user.plan.ownerId === userId)?.plan ?? null
  }

  async getById(planId: string): Promise<PlanUsage | PlanInfinity | null> {
    return this.usersMemory.users.find(user => user.plan.id_plan === planId)?.plan ?? null
  }

  async update(plan: PlanUsage | PlanInfinity): Promise<void> {
    this.usersMemory.assignPlan(plan)
  }

  async list(): Promise<(PlanUsage | PlanInfinity)[]> {
    return this.usersMemory.users.map(u => u.plan)
  }
}
