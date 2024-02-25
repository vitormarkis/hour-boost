import { z } from "zod"
import { Usage } from "../../entity/plan/Usage"
import { UsageList } from "core/entity/plan"

export abstract class Plan {
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
}

export type PlanAllNames = PlanInfinityName | PlanUsageName
export type PlanStatus = "FARMING" | "IDDLE"
export type PlanCustomName = Extract<PlanAllNames, "USAGE-CUSTOM" | "INFINITY-CUSTOM">
export type PlanNormalName = Exclude<PlanAllNames, "USAGE-CUSTOM" | "INFINITY-CUSTOM">

export const planUsageNameSchema = z.enum(["GUEST", "USAGE-CUSTOM"])
export type PlanUsageName = z.infer<typeof planUsageNameSchema>

export const planInfinityNameSchema = z.enum(["SILVER", "GOLD", "DIAMOND", "INFINITY-CUSTOM"])
export type PlanInfinityName = z.infer<typeof planInfinityNameSchema>

export type PlanType = "INFINITY" | "USAGE"
