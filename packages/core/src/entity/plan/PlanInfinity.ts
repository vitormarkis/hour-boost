import { Plan, PlanInfinityName } from "../../entity/plan/Plan"

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
}

export type PlanInfinityAllProps = {
  id_plan: string
  name: PlanInfinityName
  price: number
  ownerId: string
  maxSteamAccounts: number
  maxGamesAllowed: number
  autoRestarter: boolean
}

export type PlanInfinityRestoreProps = {
  id_plan: string
  ownerId: string
}
