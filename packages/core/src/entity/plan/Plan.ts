import { UsageList } from "core/entity/plan"
import { makeError } from "core/utils/throw"
import { Usage } from "../../entity/plan/Usage"

export abstract class Plan {
  custom: boolean
  id_plan: string
  readonly name: PlanAllNames
  maxSteamAccounts: number
  maxGamesAllowed: number
  autoRestarter: boolean
  ownerId: string
  type: PlanType
  private _status: PlanStatus
  usages: UsageList
  price: number

  constructor(props: PlanAllProps) {
    switch (props.name) {
      case "DIAMOND":
      case "GOLD":
      case "SILVER":
        if (props.type !== "INFINITY") {
          throw makeError("Invariant! Mismatch entre o tipo do plano e o nome", props)
        }
        break
      case "GUEST":
        if (props.type !== "USAGE") {
          throw makeError("Invariant! Mismatch entre o tipo do plano e o nome", props)
        }
        break
    }

    this.maxSteamAccounts = props.maxSteamAccounts
    this.maxGamesAllowed = props.maxGamesAllowed
    this.autoRestarter = props.autoRestarter
    this.ownerId = props.ownerId
    this.id_plan = props.id_plan
    this.type = props.type
    this.name = props.name
    this._status = props.status
    this.usages = props.usages
    this.price = props.price
    this.custom = props.custom
  }

  abstract use(usage: Usage): void

  startFarm() {
    this._status = "FARMING"
  }

  stopFarm() {
    this._status = "IDDLE"
  }

  get status() {
    return this._status
  }
}

export interface PlanProps {
  id_plan: string
  ownerId: string
  usages: UsageList
}

export interface PlanCreateProps {
  ownerId: string
}

export type PlanAllProps = {
  id_plan: string
  name: PlanAllNames
  price: number
  ownerId: string
  maxSteamAccounts: number
  maxGamesAllowed: number
  autoRestarter: boolean
  type: PlanType
  status: PlanStatus
  usages: UsageList
  custom: boolean
}

export type PlanAllNames = PlanInfinityName | PlanUsageName
export type PlanStatus = "FARMING" | "IDDLE"

export type PlanUsageName = "GUEST"
export type PlanInfinityName = "SILVER" | "GOLD" | "DIAMOND"

export type PlanType = "INFINITY" | "USAGE"
