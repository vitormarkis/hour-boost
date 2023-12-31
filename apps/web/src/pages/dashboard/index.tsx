import { HeaderDashboard } from "@/components/layouts/Header/header-dashboard"
import { ModalAddSteamAccount } from "@/components/molecules/modal-add-steam-account"
import { Button } from "@/components/ui/button"
import { UserSession } from "core"
import { GetServerSideProps } from "next"
import React from "react"

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
    <>
      <HeaderDashboard user={user} />
      <div className="max-w-[1440px] w-full mx-auto px-8">
        <ModalAddSteamAccount userId={user.id_user}>
          <Button className="h-9">Adicionar conta +</Button>
        </ModalAddSteamAccount>
      </div>
      <div className="max-w-[1440px] w-full mx-auto px-8">
        <DashboardSteamAccountsList user={user} />
      </div>
    </>
  )
}

import { DashboardSteamAccountsList } from "@/components/layouts/DashboardSteamAccountsList"
import { api } from "@/lib/axios"

export function isResponseOK(status: number) {
  return status >= 200 && status <= 299
}
