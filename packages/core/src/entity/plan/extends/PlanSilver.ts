import { PlanInfinity, PlanInfinityRestoreProps } from "../../../entity/plan/PlanInfinity"
import { makeID } from "../../../entity/generateID"
import { PlanCreateProps, PlanProps } from "../../../entity/plan/Plan"
import { UsageList } from "core/entity/plan/UsageList"

export class SilverPlan extends PlanInfinity {
  private constructor(props: PlanProps) {
    super({
      ...props,
      maxGamesAllowed: 1,
      maxSteamAccounts: 1,
      autoRestarter: true,
      name: "SILVER",
      price: 1200,
    })
  }

  static create(props: PlanCreateProps) {
    return new SilverPlan({
      ownerId: props.ownerId,
      id_plan: makeID(),
      usages: new UsageList(),
    })
  }

  static restore(props: PlanInfinityRestoreProps) {
    return new SilverPlan(props)
  }
}
