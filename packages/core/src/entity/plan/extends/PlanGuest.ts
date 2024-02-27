import { UsageList } from "core/entity/plan/UsageList"
import { makeID } from "../../../entity/generateID"
import { PlanUsage, PlanUsageCreateProps, PlanUsageRestoreProps } from "../../../entity/plan/PlanUsage"

export class GuestPlan extends PlanUsage {
  private constructor(props: PlanUsageRestoreProps) {
    super({
      ...props,
      maxGamesAllowed: 1,
      maxSteamAccounts: 1,
      autoRestarter: false,
      maxUsageTime: 60 * 60 * 6, // 6 hours in seconds
      name: "GUEST",
      price: 0,
      custom: false,
    })
  }

  static create(props: PlanUsageCreateProps) {
    return new GuestPlan({
      usages: new UsageList(),
      ownerId: props.ownerId,
      id_plan: makeID(),
    })
  }

  static restore(props: PlanUsageRestoreProps) {
    return new GuestPlan(props)
  }
}
