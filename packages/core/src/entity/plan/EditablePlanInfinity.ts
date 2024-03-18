import { EditablePlan } from "core/entity/plan/EditablePlan"
import { IEditablePlanInfinity } from "core/entity/plan/IEditablePlan"
import { PlanInfinity } from "core/entity/plan/PlanInfinity"

export class EditablePlanInfinity implements IEditablePlanInfinity {
  constructor(
    readonly plan: PlanInfinity,
    readonly editablePlan: EditablePlan
  ) {}

  setMaxGamesAmount(amount: number): void {
    this.editablePlan.setMaxGamesAmount(amount)
  }
  setMaxAccountsAmount(amount: number): void {
    this.editablePlan.setMaxAccountsAmount(amount)
  }
}
