import { UsageList } from "core/entity/plan/UsageList"
import { makeID } from "../../generateID"
import { PlanUsage } from "../PlanUsage"

export type PlanSetters = {
  setMaxGamesAllowed(newMaxGamesAllowed: number): void
}

export type PlanInvariant = {}

export class CustomUsagePlan extends PlanUsage implements PlanSetters {
  private constructor(props: PlanCustomUsageRestoreProps) {
    super({
      ...props,
      name: "USAGE-CUSTOM",
      autoRestarter: false,
      custom: true,
    })
  }

  setMaxGamesAllowed(newMaxGamesAllowed: number): void {
    this.maxGamesAllowed = newMaxGamesAllowed
  }

  static create(props: PlanCustomUsageCreateProps) {
    return new CustomUsagePlan({
      ...props,
      usages: new UsageList(),
      ownerId: props.ownerId,
      id_plan: makeID(),
    })
  }

  static restore(props: PlanCustomUsageRestoreProps) {
    return new CustomUsagePlan(props)
  }

  static fromPlan(plan: PlanUsage, price: number) {
    return CustomUsagePlan.restore({
      id_plan: plan.id_plan,
      maxGamesAllowed: plan.maxGamesAllowed,
      maxSteamAccounts: plan.maxSteamAccounts,
      maxUsageTime: plan.maxUsageTime,
      ownerId: plan.ownerId,
      usages: plan.usages,
      price,
    })
  }
}

export type PlanCustomUsageCreateProps = {
  ownerId: string
  maxGamesAllowed: number
  maxSteamAccounts: number
  maxUsageTime: number
  price: number
}

export type PlanCustomUsageRestoreProps = {
  id_plan: string
  ownerId: string
  usages: UsageList
  maxGamesAllowed: number
  maxSteamAccounts: number
  maxUsageTime: number
  price: number
}
