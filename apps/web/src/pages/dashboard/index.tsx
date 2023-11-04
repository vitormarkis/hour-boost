import { Header } from "@/components/layouts/Header"
import { HeaderDashboard } from "@/components/layouts/Header/header-dashboard"
import { ModalAddSteamAccount } from "@/components/molecules/modal-add-steam-account"
import { Button } from "@/components/ui/button"
import { UserSession } from "core"
import { GetServerSideProps } from "next"
import React from "react"

export const getServerSideProps: GetServerSideProps = async ctx => {
  const response = await fetch("http://localhost:3309/me", {
    headers: ctx.req.headers as Record<string, string>,
  })
  const user: UserSession | null = await response.json()

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
      <div className="max-w-7xl w-full mx-auto px-8">
        <ModalAddSteamAccount>
          <Button className="h-9">Adicionar conta +</Button>
        </ModalAddSteamAccount>
      </div>
    </>
  )
}
