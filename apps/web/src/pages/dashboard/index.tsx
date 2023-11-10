import { HeaderDashboard } from "@/components/layouts/Header/header-dashboard"
import { ModalAddSteamAccount } from "@/components/molecules/modal-add-steam-account"
import { Button } from "@/components/ui/button"
import { API_GET_SteamAccounts, ISteamAccountSession, UserSession } from "core"
import { GetServerSideProps } from "next"
import React from "react"
import { useAuth } from "@clerk/clerk-react"

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
      <div className="max-w-7xl w-full mx-auto px-8">
        <ModalAddSteamAccount userId={user.id_user}>
          <Button className="h-9">Adicionar conta +</Button>
        </ModalAddSteamAccount>
      </div>
      <div className="max-w-7xl w-full mx-auto px-8">
        <ListSteamAccounts user={user} />
      </div>
    </>
  )
}

import { cn } from "@/lib/utils"
import { api } from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"

export type ListSteamAccountsProps = React.ComponentPropsWithoutRef<"section"> & {
  user: UserSession
}

export const ListSteamAccounts = React.forwardRef<React.ElementRef<"section">, ListSteamAccountsProps>(
  function ListSteamAccountsComponent({ user, className, ...props }, ref) {
    const { getToken } = useAuth()

    const {
      data,
      error: errorSteamAccounts,
      isLoading: isLoadingSteamAccounts,
    } = useQuery<API_GET_SteamAccounts>({
      queryKey: ["steam-accounts", user.id_user],
      queryFn: async () => {
        try {
          const response = await api.get<API_GET_SteamAccounts>("/steam-accounts", {
            headers: {
              Authorization: `Bearer ${await getToken()}`,
            },
          })

          return response.data
        } catch (error) {
          console.log(error)
          if (error instanceof AxiosError) {
            throw new Error(error.message)
          }
          throw error
        }
      },
      staleTime: 1000 * 60, // 1 minute
    })

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

    if (!data || isLoadingSteamAccounts) {
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

    const { steamAccounts } = data

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

export function isResponseOK(status: number) {
  return status >= 200 && status <= 299
}
