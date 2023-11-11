import { PlanCreateProps, PlanProps } from "../Plan"
import { makeID } from "../../generateID"
import { PlanInfinity, PlanInfinityRestoreProps } from "../PlanInfinity"

export class DiamondPlan extends PlanInfinity {
  private constructor(props: PlanProps) {
    super({
      ...props,
      maxGamesAllowed: 32,
      maxSteamAccounts: 2,
      autoRestarter: true,
      name: "DIAMOND",
      price: 2200,
    })
  }

  static create(props: PlanCreateProps) {
    return new DiamondPlan({
      ownerId: props.ownerId,
      id_plan: makeID(),
    })
  }

  static restore(props: PlanInfinityRestoreProps) {
    return new DiamondPlan(props)
  }
}
