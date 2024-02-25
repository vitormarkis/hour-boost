import { UsageList } from "core/entity/plan/UsageList"
import { makeID } from "../../generateID"
import { PlanUsage } from "../PlanUsage"

export class CustomUsagePlan extends PlanUsage {
  private constructor(props: PlanCustomUsageRestoreProps) {
    super({
      ...props,
      name: "USAGE-CUSTOM",
      autoRestarter: false,
      price: 0,
    })
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
}

export type PlanCustomUsageCreateProps = {
  ownerId: string
  maxGamesAllowed: number
  maxSteamAccounts: number
  maxUsageTime: number
}

export type PlanCustomUsageRestoreProps = {
  id_plan: string
  ownerId: string
  usages: UsageList
  maxGamesAllowed: number
  maxSteamAccounts: number
  maxUsageTime: number
}
