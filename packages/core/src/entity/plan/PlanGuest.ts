import { Plan, PlanCreateProps, PlanProps } from "./Plan"
import { makeID } from "../generateID"

export class GuestPlan extends Plan {
  private constructor(props: PlanProps) {
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

  static create(props: PlanCreateProps) {
    return new GuestPlan({
      ownerId: props.ownerId,
      usages: [],
      id_plan: makeID(),
    })
  }

  static restore(props: PlanProps) {
    return new GuestPlan(props)
  }
}
