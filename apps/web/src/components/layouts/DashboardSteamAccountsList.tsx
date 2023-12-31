import React from "react"
import { cn } from "@/lib/utils"
import { SteamAccountList, SteamAccountListItemView } from "@/components/molecules/SteamAccountListItem"
import { API_GET_SteamAccounts, UserSession } from "core"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import { useAuth } from "@clerk/clerk-react"
import { AxiosError } from "axios"

export type DashboardSteamAccountsListProps = React.ComponentPropsWithoutRef<"section"> & {
  user: UserSession
}

export const DashboardSteamAccountsList = React.forwardRef<
  React.ElementRef<"section">,
  DashboardSteamAccountsListProps
>(function DashboardSteamAccountsListComponent({ user, className, ...props }, ref) {
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
      className={cn("flex flex-col gap-2 p-2", className)}
      ref={ref}
    >
      {steamAccounts.map(({ id_steamAccount, accountName, profilePictureUrl }, index) => (
        <SteamAccountList
          header={index === 0}
          accountName={accountName}
          maxGamesAllowed={user.plan.maxGamesAllowed}
          profilePictureUrl={profilePictureUrl}
          userId={user.id_user}
          key={id_steamAccount}
        />
      ))}
    </section>
  )
})

DashboardSteamAccountsList.displayName = "DashboardSteamAccountsList"
