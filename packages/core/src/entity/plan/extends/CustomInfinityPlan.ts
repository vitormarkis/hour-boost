import { UsageList } from "core/entity/plan/UsageList"
import { makeID } from "../../../entity/generateID"
import { PlanCreateProps, PlanProps } from "../../../entity/plan/Plan"
import { PlanInfinity } from "../../../entity/plan/PlanInfinity"

export class CustomInfinityPlan extends PlanInfinity {
  private constructor(props: PlanInfinityCustomRestoreProps) {
    super({
      ...props,
      name: "INFINITY-CUSTOM",
    })
  }

  static create(props: PlanCreateProps & CustomProps) {
    return new CustomInfinityPlan({
      ...props,
      id_plan: makeID(),
      usages: new UsageList(),
    })
  }

  static restore(props: PlanInfinityCustomRestoreProps) {
    return new CustomInfinityPlan(props)
  }
}

type PlanInfinityCustomRestoreProps = PlanProps & CustomProps

type CustomProps = {
  maxGamesAllowed: number
  maxSteamAccounts: number
  autoRestarter: boolean
  price: number
}
