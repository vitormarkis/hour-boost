import { Usage } from "core/entity/plan/Usage"
import { Plan, PlanInfinityName } from "../../entity/plan/Plan"
import { UsageList } from "core/entity/plan/UsageList"

export class PlanInfinity extends Plan {
  readonly name: PlanInfinityName

  constructor(props: PlanInfinityAllProps) {
    super({
      ...props,
      type: "INFINITY",
      status: "IDDLE",
    })
    this.name = props.name
  }

  use(usage: Usage): void {
    this.usages.add(usage)
  }
}

export type PlanInfinityAllProps = {
  id_plan: string
  name: PlanInfinityName
  price: number
  ownerId: string
  maxSteamAccounts: number
  maxGamesAllowed: number
  autoRestarter: boolean
  usages: UsageList
}

export type PlanInfinityRestoreProps = {
  id_plan: string
  ownerId: string
  usages: UsageList
}
