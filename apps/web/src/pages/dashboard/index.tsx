import { DashboardSteamAccountsList } from "@/components/layouts/DashboardSteamAccountsList"
import { HeaderDashboard } from "@/components/layouts/Header/header-dashboard"
import { UserPlanStatus } from "@/components/layouts/UserPlanStatus/component"
import { UserProvider } from "@/contexts/UserContext"
import { getUserSession } from "@/server-fetch/getUserSession"
import { ServerHeaders } from "@/server-fetch/server-headers"
import { UserSessionParams } from "@/server-fetch/types"
import { generateNextCommand } from "@/util/generateNextCommand"
import { UserSession } from "core"
import { GetServerSideProps } from "next"
import Head from "next/head"

export type GetMeResponse = {
  code: `USER-SESSION::${string}`
  userSession: UserSession
}

export const getServerSideProps: GetServerSideProps = async ctx => {
  const serverHeaders = new ServerHeaders(ctx)
  serverHeaders.appendAuthorization()

  const [error, userSessionResponse] = await getUserSession({ headers: ctx.req.headers })
  if (error) throw error
  const { data, headers } = userSessionResponse

  if (headers["set-cookie"]) ctx.res.setHeader("set-cookie", headers["set-cookie"])

  const command = await generateNextCommand({
    subject: {
      user: data?.userSession,
      serverHeaders: serverHeaders.toJSON(),
    },
    options: {
      shouldRedirectToPathIf({ user }) {
        if (user === null) return "/sign-in"
      },
    },
  })
  return command
}

export default function DashboardPage({ user, serverHeaders }: UserSessionParams) {
  console.log(user)
  return (
    <UserProvider
      serverUser={user}
      serverHeaders={serverHeaders}
    >
      <Head>
        <title>Hourboost - Painel</title>
        <link
          rel="shortcut icon"
          href="/favicon.ico"
        />
      </Head>
      <HeaderDashboard />
      <div className="max-w-[1440px] w-full mx-auto mdx:px-8">
        <UserPlanStatus />
        <DashboardSteamAccountsList />
      </div>
    </UserProvider>
  )
}
