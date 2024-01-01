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

  console.log(user.steamAccounts)

  return (
    <section
      {...props}
      className={cn("flex flex-col gap-2 p-2", className)}
      ref={ref}
    >
      {user.steamAccounts.map((app, index) => (
        <SteamAccountList
          key={app.id_steamAccount}
          app={app}
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
