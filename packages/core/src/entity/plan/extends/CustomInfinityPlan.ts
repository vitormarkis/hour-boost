import { UsageList } from "core/entity/plan/UsageList"
import { makeID } from "../../../entity/generateID"
import { PlanCreateProps, PlanProps } from "../../../entity/plan/Plan"
import { PlanInfinity } from "../../../entity/plan/PlanInfinity"
import { PlanSetters } from "./CustomUsagePlan"

export class CustomInfinityPlan extends PlanInfinity implements PlanSetters {
  private constructor(props: PlanInfinityCustomRestoreProps) {
    super({
      ...props,
      name: "INFINITY-CUSTOM",
      custom: true,
    })
  }
  setMaxGamesAllowed(newMaxGamesAllowed: number): void {
    this.maxGamesAllowed = newMaxGamesAllowed
  }

  static create(props: PlanCreateProps & CustomProps) {
    return new CustomInfinityPlan({
      ...props,
      id_plan: makeID(),
      usages: new UsageList(),
    })
  }

  static restore(props: PlanInfinityCustomRestoreProps) {
    return new CustomInfinityPlan(props)
  }

  static fromPlan(plan: PlanInfinity, price: number) {
    return CustomInfinityPlan.restore({
      autoRestarter: plan.autoRestarter,
      id_plan: plan.id_plan,
      maxGamesAllowed: plan.maxGamesAllowed,
      maxSteamAccounts: plan.maxSteamAccounts,
      ownerId: plan.ownerId,
      usages: plan.usages,
      price,
    })
  }
}

type PlanInfinityCustomRestoreProps = PlanProps & CustomProps

type CustomProps = {
  maxGamesAllowed: number
  maxSteamAccounts: number
  autoRestarter: boolean
  price: number
}
