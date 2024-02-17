import { HeaderDashboard } from "@/components/layouts/Header/header-dashboard"
import { UserAdminItemList } from "@/components/layouts/pages/admin/components/AdminUserItemList"
import { ApplicationStatus } from "@/components/layouts/pages/admin/components/ApplicationStatus"
import { UserProvider } from "@/contexts/UserContext"
import {
  PlanAllNames,
  PlanInfinitySession,
  PlanUsageSession,
  RoleName,
  StatusName,
  SteamAccountSession,
} from "core"
import { GetServerSideProps } from "next"
import { generateNextCommand } from "@/util/generateNextCommand"
import { getUserSession } from "@/server-fetch/getUserSession"
import { UserSessionParams } from "@/server-fetch/types"
import { ServerHeaders } from "@/server-fetch/server-headers"

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
  const serverHeaders = new ServerHeaders(ctx)
  serverHeaders.appendAuthorization()

  const [error, userSessionResponse] = await getUserSession({ headers: ctx.req.headers })
  if (error) throw error.message
  const { data, headers } = userSessionResponse

  if (headers["set-cookie"]) ctx.res.setHeader("set-cookie", headers["set-cookie"])

  const command = await generateNextCommand({
    subject: {
      user: data?.userSession,
      serverHeaders: serverHeaders.toJSON(),
    },
    options: {
      shouldShowNotFoundPageWhen({ user }) {
        return user?.role !== "ADMIN"
      },
    },
  })
  return command
}

export default function AdminDashboard({ user, serverHeaders }: UserSessionParams) {
  return (
    <UserProvider
      serverUser={user}
      serverHeaders={serverHeaders}
    >
      <HeaderDashboard />
      <div className="max-w-[1440px] w-full mx-auto mdx:px-8">
        <div className="mt-8">
          <ApplicationStatus />
          <UserAdminItemList />
        </div>
      </div>
    </UserProvider>
  )
}
