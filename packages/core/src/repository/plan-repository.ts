import { Plan, PlanInfinity, PlanUsage } from "../entity"

export interface PlanRepository {
  update(plan: Plan): Promise<void>
  getById(planId: string): Promise<PlanUsage | PlanInfinity | null>
}
