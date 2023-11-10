import { Plan, PlanCreateProps, PlanProps } from "./Plan"
import { makeID } from "../generateID"

export class DiamondPlan extends Plan {
  private constructor(props: PlanProps) {
    super({
      ...props,
      maxGamesAllowed: 32,
      maxSteamAccounts: 2,
      autoRestarter: true,
      maxUsageTime: 60 * 60 * 24 * 30, // 1 mês
      name: "DIAMOND",
      price: 2200,
    })
  }

  static create(props: PlanCreateProps) {
    return new DiamondPlan({
      ownerId: props.ownerId,
      usages: [],
      id_plan: makeID(),
    })
  }

  static restore(props: PlanProps) {
    return new DiamondPlan(props)
  }
}
