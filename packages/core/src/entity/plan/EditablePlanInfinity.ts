import { EditablePlan } from "core/entity/plan/EditablePlan"
import { IEditablePlanInfinity } from "core/entity/plan/IEditablePlan"

export class EditablePlanInfinity implements IEditablePlanInfinity {
  constructor(private readonly editablePlan: EditablePlan) {}

  setMaxGamesAmount(amount: number): void {
    this.editablePlan.setMaxGamesAmount(amount)
  }
  setMaxAccountsAmount(amount: number): void {
    this.editablePlan.setMaxAccountsAmount(amount)
  }
}
