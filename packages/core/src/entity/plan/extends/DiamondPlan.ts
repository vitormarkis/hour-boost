import { makeID } from "core/entity/generateID"
import {
  PlanInfinity,
  PlanInfinityConstructorProps,
  PlanInfinityCreateProps,
  PlanInfinityRestoreFromCustomProps,
  PlanInfinityRestoreProps,
} from "core/entity/plan/PlanInfinity"
import { UsageList } from "core/entity/plan/UsageList"
import { combine } from "core/utils/combine"

const defaultProps = {
  maxGamesAllowed: 32,
  maxSteamAccounts: 2,
  autoRestarter: true,
  name: "DIAMOND",
  price: 2200,
  custom: false,
} as const

export class DiamondPlan extends PlanInfinity {
  private constructor(props: PlanInfinityConstructorProps) {
    super(props)
  }

  static create(props: PlanInfinityCreateProps) {
    return new DiamondPlan(
      combine<PlanInfinityConstructorProps, typeof props, typeof defaultProps>(props, defaultProps, {
        id_plan: makeID(),
        usages: new UsageList(),
      })
    )
  }

  static restore(props: PlanInfinityRestoreProps) {
    return new DiamondPlan(
      combine<PlanInfinityConstructorProps, typeof props, typeof defaultProps>(props, defaultProps, {})
    )
  }

  static restoreFromCustom(props: PlanInfinityRestoreFromCustomProps) {
    return new DiamondPlan(
      combine<PlanInfinityConstructorProps, typeof props>(
        props,
        {},
        {
          name: "DIAMOND",
          custom: true,
        }
      )
    )
  }
}
