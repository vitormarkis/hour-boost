import { DashboardSteamAccountsList } from "@/components/layouts/DashboardSteamAccountsList"
import { HeaderDashboard } from "@/components/layouts/Header/header-dashboard"
import { UserPlanStatus } from "@/components/layouts/UserPlanStatus/component"
import { UserProvider } from "@/contexts/UserContext"
import { UserSessionParams } from "@/server-fetch/types"
import { userProcedure } from "@/server-fetch/userProcedure"
import { UserSession } from "core"
import Head from "next/head"

export type GetMeResponse = {
  code: `USER-SESSION::${string}`
  userSession: UserSession
}

export const getServerSideProps = userProcedure({
  shouldRedirectToPathIf({ user }) {
    if (user === null) return "/sign-in"
  },
})

export default function DashboardPage({ user }: UserSessionParams) {
  return (
    <UserProvider serverUser={user}>
      <Head>
        <title>Hourboost - Painel</title>
        <link
          rel="shortcut icon"
          href="/favicon.ico"
        />
      </Head>
      <HeaderDashboard
        username={user.username}
        profilePic={user.profilePic}
      />
      <div className="max-w-[1440px] w-full mx-auto mdx:px-8">
        <UserPlanStatus />
        <DashboardSteamAccountsList />
      </div>
    </UserProvider>
  )
}
