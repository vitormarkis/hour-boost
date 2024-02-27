import { PlanCreateProps, PlanProps } from "../Plan"
import { makeID } from "../../generateID"
import { PlanInfinity, PlanInfinityRestoreProps } from "../../../entity/plan/PlanInfinity"
import { UsageList } from "core/entity/plan/UsageList"
import { PlanInvariant } from "./CustomUsagePlan"

export class GoldPlan extends PlanInfinity {
  private constructor(props: PlanProps) {
    super({
      ...props,
      maxGamesAllowed: 32,
      maxSteamAccounts: 1,
      autoRestarter: true,
      name: "GOLD",
      price: 1800,
      custom: false,
    })
  }

  static create(props: PlanCreateProps) {
    return new GoldPlan({
      ownerId: props.ownerId,
      id_plan: makeID(),
      usages: new UsageList(),
    })
  }

  static restore(props: PlanInfinityRestoreProps) {
    return new GoldPlan(props)
  }
}
