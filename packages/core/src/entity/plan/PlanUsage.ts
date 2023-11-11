import { Usage } from "../../entity/plan/Usage"
import { Plan, PlanUsageName } from "../../entity/plan/Plan"
import { UsageUsedMoreThanPlanAllows } from "../../entity/exceptions"

export abstract class PlanUsage extends Plan {
  readonly name: PlanUsageName
  readonly maxUsageTime: number
  usages: Usage[]

  constructor(props: PlanUsageAllProps) {
    super({
      ...props,
      type: "USAGE",
    })
    this.maxUsageTime = props.maxUsageTime
    this.usages = props.usages
    this.name = props.name
  }

  getUsageTotal(): number {
    return this.usages.reduce((total, usage) => {
      total += usage.amountTime
      return total
    }, 0)
  }

  getUsageLeft(): number {
    const usageTotal = this.getUsageTotal()
    return this.maxUsageTime - usageTotal
  }

  use(usage: Usage): void | UsageUsedMoreThanPlanAllows {
    if (usage.amountTime + this.getUsageTotal() > this.maxUsageTime) {
      const usageWithRemainingUsageLeft = Usage.restore({
        amountTime: this.getUsageLeft(),
        createdAt: usage.createdAt,
        id_usage: usage.id_usage,
        plan_id: this.id_plan,
      })
      this.usages.push(usageWithRemainingUsageLeft)
      return new UsageUsedMoreThanPlanAllows()
    }
    this.usages.push(usage)
  }

  get isFarmAvailable() {
    const amountUsedSoFar = this.usages.reduce((amount, usage) => (amount + usage.amountTime, amount), 0)
    return amountUsedSoFar < this.maxUsageTime
  }
}

export type PlanUsageRestoreProps = {
  id_plan: string
  ownerId: string
  usages: Usage[]
}

export type PlanUsageCreateProps = {
  ownerId: string
}

export type PlanUsageAllProps = {
  id_plan: string
  name: PlanUsageName
  price: number
  ownerId: string
  maxSteamAccounts: number
  maxGamesAllowed: number
  autoRestarter: boolean
  maxUsageTime: number
  usages: Usage[]
}
