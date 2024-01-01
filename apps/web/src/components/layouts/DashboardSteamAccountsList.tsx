import { SteamAccountList } from "@/components/molecules/SteamAccountListItem"
import { useUser } from "@/contexts/UserContext"
import { cn } from "@/lib/utils"
import React from "react"

export type DashboardSteamAccountsListProps = React.ComponentPropsWithoutRef<"section"> & {}

export const DashboardSteamAccountsList = React.forwardRef<
  React.ElementRef<"section">,
  DashboardSteamAccountsListProps
>(function DashboardSteamAccountsListComponent({ className, ...props }, ref) {
  const user = useUser()

  return (
    <section
      {...props}
      className={cn("flex flex-col gap-2 p-2", className)}
      ref={ref}
    >
      {user.steamAccounts.map(({ id_steamAccount, accountName, profilePictureUrl, games }, index) => (
        <SteamAccountList
          key={id_steamAccount}
          app={{
            accountName,
            games,
            id_steamAccount,
            profilePictureUrl,
          }}
          status={{
            maxGamesAllowed: user.plan.maxGamesAllowed,
            header: index === 0,
          }}
        />
      ))}
    </section>
  )
})

DashboardSteamAccountsList.displayName = "DashboardSteamAccountsList"
