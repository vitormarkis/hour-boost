import { Plan, PlanCreateProps, PlanInfinityName } from "core/entity/plan"
import { Usage } from "core/entity/plan/Usage"
import { UsageList } from "core/entity/plan/UsageList"

export class PlanInfinity extends Plan {
  readonly name: PlanInfinityName

  constructor(props: PlanInfinityConstructorProps) {
    super({
      ...props,
      type: "INFINITY",
      status: "IDDLE",
    })
    this.name = props.name
    this.custom = props.custom
  }

  use(usage: Usage): void {
    this.usages.add(usage)
  }
}

export type PlanInfinityConstructorProps = {
  id_plan: string
  name: PlanInfinityName
  price: number
  ownerId: string
  maxSteamAccounts: number
  maxGamesAllowed: number
  autoRestarter: boolean
  usages: UsageList
  custom: boolean
}

export type PlanInfinityCreateProps = PlanCreateProps

export type PlanInfinityRestoreProps = {
  id_plan: string
  ownerId: string
  usages: UsageList
}

export type PlanInfinityRestoreFromCustomProps = PlanInfinityRestoreProps & {
  maxGamesAllowed: number
  maxSteamAccounts: number
  autoRestarter: boolean
  price: number
}
