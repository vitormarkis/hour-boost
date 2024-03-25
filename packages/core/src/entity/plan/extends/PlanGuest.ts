import { makeID } from "core/entity/generateID"
import {
  PlanUsage,
  PlanUsageConstructorProps,
  PlanUsageCreateProps,
  PlanUsageRestoreFromCustomProps,
  PlanUsageRestoreProps,
} from "core/entity/plan/PlanUsage"
import { UsageList } from "core/entity/plan/UsageList"
import { combine } from "core/utils/combine"

const defaultProps = {
  maxGamesAllowed: 1,
  maxSteamAccounts: 1,
  autoRestarter: false,
  maxUsageTime: 60 * 60 * 6, // 6 hours in seconds
  name: "GUEST",
  price: 0,
  custom: false,
} as const

export class GuestPlan extends PlanUsage {
  private constructor(props: PlanUsageConstructorProps) {
    super(props)
  }

  static create(props: PlanUsageCreateProps) {
    return new GuestPlan(
      combine<PlanUsageConstructorProps, typeof props, typeof defaultProps>(props, defaultProps, {
        id_plan: makeID(),
        usages: new UsageList(),
      })
    )
  }

  static restore(props: PlanUsageRestoreProps) {
    return new GuestPlan(
      combine<PlanUsageConstructorProps, typeof props, typeof defaultProps>(props, defaultProps, {})
    )
  }

  static restoreFromCustom(props: PlanUsageRestoreFromCustomProps) {
    return new GuestPlan(
      combine<PlanUsageConstructorProps, typeof props>(
        props,
        {},
        {
          name: "GUEST",
          custom: true,
        }
      )
    )
  }
}
