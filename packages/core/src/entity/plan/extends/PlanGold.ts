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
  maxSteamAccounts: 1,
  autoRestarter: true,
  name: "GOLD",
  price: 1800,
  custom: false,
} as const

export class GoldPlan extends PlanInfinity {
  private constructor(props: PlanInfinityConstructorProps) {
    super(props)
  }

  static create(props: PlanInfinityCreateProps) {
    return new GoldPlan(
      combine<PlanInfinityConstructorProps, typeof props, typeof defaultProps>(props, defaultProps, {
        id_plan: makeID(),
        usages: new UsageList(),
      })
    )
  }

  static restore(props: PlanInfinityRestoreProps) {
    return new GoldPlan(
      combine<PlanInfinityConstructorProps, typeof props, typeof defaultProps>(props, defaultProps, {})
    )
  }

  static restoreFromCustom(props: PlanInfinityRestoreFromCustomProps) {
    return new GoldPlan(
      combine<PlanInfinityConstructorProps, typeof props>(
        props,
        {},
        {
          name: "GOLD",
          custom: true,
        }
      )
    )
  }
}
