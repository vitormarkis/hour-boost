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
  maxGamesAllowed: 1,
  maxSteamAccounts: 1,
  autoRestarter: true,
  name: "SILVER",
  price: 1200,
  custom: false,
} as const

export class SilverPlan extends PlanInfinity {
  private constructor(props: PlanInfinityConstructorProps) {
    super(props)
  }

  static create(props: PlanInfinityCreateProps) {
    return new SilverPlan(
      combine<PlanInfinityConstructorProps, typeof props, typeof defaultProps>(props, defaultProps, {
        id_plan: makeID(),
        usages: new UsageList(),
      })
    )
  }

  static restore(props: PlanInfinityRestoreProps) {
    return new SilverPlan(
      combine<PlanInfinityConstructorProps, typeof props, typeof defaultProps>(props, defaultProps, {})
    )
  }

  static restoreFromCustom(props: PlanInfinityRestoreFromCustomProps) {
    return new SilverPlan(
      combine<PlanInfinityConstructorProps, typeof props>(
        props,
        {},
        {
          name: "SILVER",
          custom: true,
        }
      )
    )
  }
}
