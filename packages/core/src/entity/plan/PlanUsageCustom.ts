import { Usage } from "../../entity/plan/Usage"
import { Plan, PlanUsageName } from "../../entity/plan/Plan"
import { UsageUsedMoreThanPlanAllows } from "../../entity/exceptions"
import { UsageList } from "core/entity/plan/UsageList"

export abstract class PlanUsageCustom extends Plan {
  readonly name: PlanUsageName
  readonly maxUsageTime: number

  constructor(props: PlanUsageCustomAllProps) {
    super({
      ...props,
      type: "USAGE",
      status: "IDDLE",
    })
    this.maxUsageTime = props.maxUsageTime
    this.usages = props.usages
    this.name = props.name
  }

  getUsageTotal(): number {
    return this.usages.data.reduce((total, usage) => {
      total += usage.amountTime
      return total
    }, 0)
  }

  getUsageLeft(): number {
    const usageTotal = this.getUsageTotal()
    return this.maxUsageTime - usageTotal
  }

  removeUsage(usageID: string) {
    this.usages.remove(usageID)
  }

  use(usage: Usage): void | UsageUsedMoreThanPlanAllows {
    if (usage.amountTime + this.getUsageTotal() > this.maxUsageTime) {
      const usageWithRemainingUsageLeft = Usage.restore({
        amountTime: this.getUsageLeft(),
        createdAt: usage.createdAt,
        id_usage: usage.id_usage,
        plan_id: this.id_plan,
        accountName: usage.accountName,
      })
      this.usages.add(usageWithRemainingUsageLeft)
      return new UsageUsedMoreThanPlanAllows()
    }
    this.usages.add(usage)
  }

  isFarmAvailable() {
    console.log(this.usages)
    const amountUsedSoFar = this.usages.data.reduce((amount, usage) => {
      amount + usage.amountTime
      return amount
    }, 0)
    console.log("CALCULANDO SE FARM ESTA DISPONIVEL? DOMAIN")

    console.log({
      usageTime: this.maxUsageTime,
      amountUsedSoFar,
    })
    return amountUsedSoFar < this.maxUsageTime
  }
}

export type PlanUsageCustomRestoreProps = {
  id_plan: string
  ownerId: string
  usages: UsageList
}

export type PlanUsageCustomCreateProps = {
  ownerId: string
}

export type PlanUsageCustomAllProps = {
  id_plan: string
  name: PlanUsageName
  price: number
  ownerId: string
  maxSteamAccounts: number
  maxGamesAllowed: number
  autoRestarter: boolean
  maxUsageTime: number
  usages: UsageList
}
