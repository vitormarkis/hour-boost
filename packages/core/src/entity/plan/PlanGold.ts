import { Plan, PlanCreateProps, PlanProps } from "./Plan"
import { makeID } from "../generateID"

export class GoldPlan extends Plan {
  private constructor(props: PlanProps) {
    super({
      ...props,
      maxGamesAllowed: 32,
      maxSteamAccounts: 1,
      autoRestarter: true,
      maxUsageTime: 60 * 60 * 24 * 30, // 1 mês
      name: "GOLD",
      price: 1800,
    })
  }

  static create(props: PlanCreateProps) {
    return new GoldPlan({
      ownerId: props.ownerId,
      usages: [],
      id_plan: makeID(),
    })
  }

  static restore(props: PlanProps) {
    return new GoldPlan(props)
  }
}
