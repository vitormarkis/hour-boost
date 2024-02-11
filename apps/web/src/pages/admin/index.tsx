import { HeaderDashboard } from "@/components/layouts/Header/header-dashboard"
import { UserAdminItemList } from "@/components/layouts/pages/admin/components/AdminUserItemList"
import { PlanAllNames, PlanInfinitySession, PlanUsageSession, StatusName, SteamAccountSession } from "core"

export type UserAdminPanelSession = {
  id_user: string
  username: string
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
  when: Date
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

export default function AdminDashboard() {
  return (
    <>
      <HeaderDashboard />
      <div className="max-w-[1440px] w-full mx-auto mdx:px-8">
        <div className="border border-slate-700/50 mt-8">
          <UserAdminItemList />
        </div>
      </div>
    </>
  )
}
