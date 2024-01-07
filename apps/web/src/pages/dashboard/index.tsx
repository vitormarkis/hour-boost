import { DashboardSteamAccountsList } from "@/components/layouts/DashboardSteamAccountsList"
import { HeaderDashboard } from "@/components/layouts/Header/header-dashboard"
import { ModalAddSteamAccount } from "@/components/molecules/ModalAddSteamAccount/controller"
import { Button } from "@/components/ui/button"
import { UserProvider } from "@/contexts/UserContext"
import { api } from "@/lib/axios"
import { UserSession } from "core"
import { GetServerSideProps } from "next"

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { data: user } = await api.get<UserSession | null>("/me", {
    headers: ctx.req.headers as Record<string, string>,
  })

  if (!user) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    }
  }

  return {
    props: {
      user,
    } as UserSessionParams,
  }
}

type UserSessionParams = {
  user: UserSession
}

export default function DashboardPage({ user }: UserSessionParams) {
  return (
    <UserProvider serverUser={user}>
      <HeaderDashboard />
      <div className="max-w-[1440px] w-full mx-auto px-8">
        <ModalAddSteamAccount>
          <Button className="h-9">Adicionar conta +</Button>
        </ModalAddSteamAccount>
      </div>
      <div className="max-w-[1440px] w-full mx-auto px-8">
        <DashboardSteamAccountsList />
      </div>
    </UserProvider>
  )
}
