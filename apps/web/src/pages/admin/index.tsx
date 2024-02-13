import { HeaderDashboard } from "@/components/layouts/Header/header-dashboard"
import { UserAdminItemList } from "@/components/layouts/pages/admin/components/AdminUserItemList"
import {
  PlanAllNames,
  PlanInfinitySession,
  PlanUsageSession,
  Role,
  RoleName,
  StatusName,
  SteamAccountSession,
  UserSession,
} from "core"
import { getUserProps } from "../dashboard"
import { GetServerSideProps } from "next"
import { UserProvider } from "@/contexts/UserContext"

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

export const getServerSideProps: GetServerSideProps = async ctx => {
  const userProps = await getUserProps({ ctx })
  return userProps
}

type UserSessionParams = {
  user: UserSession
}

export default function AdminDashboard({ user }: UserSessionParams) {
  return (
    <UserProvider serverUser={user}>
      <HeaderDashboard />
      <div className="max-w-[1440px] w-full mx-auto mdx:px-8">
        <div className="mt-8">
          <UserAdminItemList />
        </div>
      </div>
    </UserProvider>
  )
}
