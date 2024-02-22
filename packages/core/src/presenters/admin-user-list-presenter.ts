import {
  PlanAllNames,
  PlanInfinitySession,
  PlanUsageSession,
  RoleName,
  StatusName,
  SteamAccountSession,
} from ".."

export type UserAdminPanelSession = {
  id_user: string
  username: string
  role: RoleName
  profilePicture: string
  plan: PlanUsageSession | PlanInfinitySession
  purchases: PurchaseSession[]
  status: StatusName
  steamAccounts: SteamAccountSession[]
}

export type PurchaseSession = {
  id_Purchase: string
  valueInCents: number
  type: PurchasePayloadSession
  when: string
}

export type PurchasePayloadSession = IPurchasePayloadTransactionPlan
export type PurchaseType = PurchasePayloadSession["name"]

export type IPurchasePayloadTransactionPlan = {
  name: "TRANSACTION-PLAN"
  from: {
    planType: PlanAllNames
  }
  to: {
    planType: PlanAllNames
  }
}
