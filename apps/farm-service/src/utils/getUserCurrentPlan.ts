import { GuestPlan, Plan, PlanCreateProps, PlanPropsWithName } from "core"
import { planFactory } from "../infra/repository/UsersRepositoryDatabase"

export function getUserCurrentPlan<T extends PlanPropsWithName | null>(
  plan: T,
  props: PlanCreateProps
): T extends null ? GuestPlan : Plan {
  if (!plan) {
    return GuestPlan.create(props)
  }

  return planFactory(plan)
}
