import { Header } from "@/components/layouts/Header"
import { HeaderDashboard } from "@/components/layouts/Header/header-dashboard"
import { ModalAddSteamAccount } from "@/components/molecules/modal-add-steam-account"
import { Button } from "@/components/ui/button"
import { IListUserSteamAccounts, UserSession } from "core"
import { GetServerSideProps } from "next"
import React from "react"
import { useAuth } from "@clerk/clerk-react"

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
      <div className="max-w-7xl w-full mx-auto px-8">
        <ListSteamAccounts />
      </div>
    </>
  )
}

import { cn } from "@/lib/utils"

export type ListSteamAccountsProps = React.ComponentPropsWithoutRef<"section"> & {}

export const ListSteamAccounts = React.forwardRef<React.ElementRef<"section">, ListSteamAccountsProps>(
  function ListSteamAccountsComponent({ className, ...props }, ref) {
    const [steamAccounts, setSteamAccounts] = React.useState<IListUserSteamAccounts.Output | null>(null)
    const [isLoadingSteamAccounts, setIsLoadingSteamAccounts] = React.useState(true)
    const [errorSteamAccounts, setErrorSteamAccounts] = React.useState(null)
    const { getToken } = useAuth()

    React.useEffect(() => {
      const fetchSteamAccounts = async () => {
        fetch("http://localhost:3309/steam-accounts", {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        })
          .then(res => res.json())
          .then(setSteamAccounts)
          .catch(setErrorSteamAccounts)
          .finally(() => setIsLoadingSteamAccounts(false))
      }

      fetchSteamAccounts()
    }, [])

    if (errorSteamAccounts) {
      return (
        <section
          {...props}
          className={cn("flex flex-col gap-2", className)}
          ref={ref}
        >
          <span className="text-red-700">Ocorreu um erro ao buscar suas contas da Steam.</span>
        </section>
      )
    }

    if (!steamAccounts || isLoadingSteamAccounts) {
      return (
        <section
          {...props}
          className={cn("flex flex-col gap-2", className)}
          ref={ref}
        >
          <span>Carregando suas contas da Steam...</span>
        </section>
      )
    }

    if (steamAccounts.length === 0) {
      return (
        <section
          {...props}
          className={cn("flex flex-col gap-2", className)}
          ref={ref}
        >
          <span>Você ainda não cadastrou nenhuma conta Steam!</span>
        </section>
      )
    }

    return (
      <section
        {...props}
        className={cn("flex flex-col gap-2", className)}
        ref={ref}
      >
        {steamAccounts.map(steamAccount => (
          <div
            key={steamAccount.accountName}
            className="h-11 bg-indigo-500 flex items-center px-4"
          >
            {steamAccount.accountName}
          </div>
        ))}
      </section>
    )
  }
)

ListSteamAccounts.displayName = "ListSteamAccounts"
