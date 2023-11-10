import { Plan, PlanCreateProps, PlanProps } from "./Plan"
import { makeID } from "../generateID"

export class SilverPlan extends Plan {
  private constructor(props: PlanProps) {
    super({
      ...props,
      maxGamesAllowed: 1,
      maxSteamAccounts: 1,
      autoRestarter: true,
      maxUsageTime: 60 * 60 * 24 * 30, // 1 mês
      name: "SILVER",
      price: 1200,
    })
  }

  static create(props: PlanCreateProps) {
    return new SilverPlan({
      ownerId: props.ownerId,
      usages: [],
      id_plan: makeID(),
    })
  }

  static restore(props: PlanProps) {
    return new SilverPlan(props)
  }
}
