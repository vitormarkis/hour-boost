import { UsageList } from "core/entity/plan/UsageList"
import { UsageUsedMoreThanPlanAllows } from "../../entity/exceptions"
import { Plan, PlanCreateProps, PlanUsageName } from "../../entity/plan/Plan"
import { Usage } from "../../entity/plan/Usage"

export abstract class PlanUsage extends Plan {
  readonly name: PlanUsageName
  maxUsageTime: number

  constructor(props: PlanUsageConstructorProps) {
    super({
      ...props,
      type: "USAGE",
      status: "IDDLE",
    })
    this.maxUsageTime = props.maxUsageTime
    this.usages = props.usages
    this.name = props.name
    this.custom = props.custom
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
        user_id: usage.user_id,
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

export type PlanUsageConstructorProps = {
  id_plan: string
  name: PlanUsageName
  price: number
  ownerId: string
  maxSteamAccounts: number
  maxGamesAllowed: number
  maxUsageTime: number
  autoRestarter: boolean
  usages: UsageList
  custom: boolean
}

export type PlanUsageCreateProps = PlanCreateProps

export type PlanUsageRestoreProps = {
  id_plan: string
  ownerId: string
  usages: UsageList
}

export type PlanUsageRestoreFromCustomProps = PlanUsageRestoreProps & {
  maxGamesAllowed: number
  maxSteamAccounts: number
  autoRestarter: boolean
  maxUsageTime: number
  price: number
}
