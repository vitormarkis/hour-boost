import { PlanCreateProps, PlanProps } from "../Plan"
import { makeID } from "../../generateID"
import { PlanInfinity, PlanInfinityRestoreProps } from "../PlanInfinity"
import { UsageList } from "core/entity/plan/UsageList"
import { PlanInvariant } from "./CustomUsagePlan"

export class DiamondPlan extends PlanInfinity implements PlanInvariant {
  private constructor(props: PlanProps) {
    super({
      ...props,
      maxGamesAllowed: 32,
      maxSteamAccounts: 2,
      autoRestarter: true,
      name: "DIAMOND",
      price: 2200,
      custom: false,
    })
  }

  static create(props: PlanCreateProps) {
    return new DiamondPlan({
      ownerId: props.ownerId,
      id_plan: makeID(),
      usages: new UsageList(),
    })
  }

  static restore(props: PlanInfinityRestoreProps) {
    return new DiamondPlan(props)
  }
}
