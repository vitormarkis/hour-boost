import { Usage } from "../../entity/plan/Usage"

export abstract class Plan {
  id_plan: string
  readonly name: PlanAllNames
  maxSteamAccounts: number
  ownerId: string
  maxGamesAllowed: number
  autoRestarter: boolean
  type: PlanType

  constructor(props: PlanAllProps) {
    this.maxSteamAccounts = props.maxSteamAccounts
    this.maxGamesAllowed = props.maxGamesAllowed
    this.autoRestarter = props.autoRestarter
    this.ownerId = props.ownerId
    this.id_plan = props.id_plan
    this.type = props.type
    this.name = props.name
  }
}

export interface PlanProps {
  id_plan: string
  ownerId: string
}

export interface PlanPropsWithName {
  name: PlanInfinityName
  id_plan: string
  ownerId: string
}

export interface PlanUsagePropsWithName {
  usages: Usage[]
  name: PlanInfinityName
  id_plan: string
  ownerId: string
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
}

export type PlanInfinityName = "SILVER" | "GOLD" | "DIAMOND"
export type PlanUsageName = "GUEST"
export type PlanAllNames = PlanInfinityName | PlanUsageName

export type PlanType = "INFINITY" | "USAGE"
