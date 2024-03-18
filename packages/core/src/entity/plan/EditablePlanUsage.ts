import { EditablePlan } from "core/entity/plan/EditablePlan"
import { IEditablePlanUsage } from "core/entity/plan/IEditablePlan"
import { PlanUsage } from "core/entity/plan/PlanUsage"
import { makeError } from "core/utils/throw"

export class EditablePlanUsage implements IEditablePlanUsage {
  constructor(
    readonly plan: PlanUsage,
    readonly editablePlan: EditablePlan
  ) {}

  setMaxGamesAmount(amount: number): void {
    this.editablePlan.setMaxGamesAmount(amount)
  }

  setMaxAccountsAmount(amount: number): void {
    this.editablePlan.setMaxAccountsAmount(amount)
  }

  addMoreUsageTime(amount: number): void {
    if (amount < 0) {
      throw makeError("Invariant! Tentou setar máximos de contas do plano com um valor fora do esperado.", {
        amount,
      })
    }
    this.plan.maxUsageTime += amount
  }
}
