import { Plan, PlanInfinity, PlanUsage } from "../entity"

export interface PlanRepository {
  update(plan: Plan): Promise<void>
  getById(planId: string): Promise<PlanUsage | PlanInfinity | null>
  getByUserId(userId: string): Promise<PlanUsage | PlanInfinity | null>
  list(): Promise<Array<PlanUsage | PlanInfinity>>
}
