import { UsageUsedMoreThanPlanAllows } from "../../entity/exceptions/UsageUsedMoreThanPlanAllows"
import { Usage } from "./Usage"

export abstract class Plan {
  id_plan: string
  name: PlanName
  maxSteamAccounts: number
  ownerId: String
  maxGamesAllowed: number
  autoRestarter: boolean
  maxUsageTime: number
  usages: Usage[]

  constructor(props: PlanAllProps) {
    this.name = props.name
    this.maxSteamAccounts = props.maxSteamAccounts
    this.maxGamesAllowed = props.maxGamesAllowed
    this.autoRestarter = props.autoRestarter
    this.maxUsageTime = props.maxUsageTime
    this.usages = props.usages
    this.ownerId = props.ownerId
    this.id_plan = props.id_plan
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

export interface PlanProps {
  id_plan: string
  usages: Usage[]
  ownerId: string
}

export interface PlanPropsWithName {
  name: PlanName
  id_plan: string
  usages: Usage[]
  ownerId: string
}

export interface PlanCreateProps {
  ownerId: string
}

export type PlanAllProps = {
  id_plan: string
  name: PlanName
  price: number
  ownerId: string
  maxSteamAccounts: number
  maxGamesAllowed: number
  autoRestarter: boolean
  maxUsageTime: number
  usages: Usage[]
}

export type PlanName = "GUEST" | "SILVER" | "GOLD" | "DIAMOND"
