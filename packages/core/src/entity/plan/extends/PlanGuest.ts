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
    })
  }

  static create(props: PlanUsageCreateProps) {
    return new GuestPlan({
      usages: [],
      ownerId: props.ownerId,
      id_plan: makeID(),
    })
  }

  static restore(props: PlanUsageRestoreProps) {
    return new GuestPlan(props)
  }
}
