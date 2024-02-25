import React from "react"
import { cn } from "@/lib/utils"
import { useUserAdminList } from "../hooks/useUserAdminList"
import { ClientOnly } from "@/components/client-only"

export type ApplicationStatusProps = React.ComponentPropsWithoutRef<"div"> & {}

export const ApplicationStatus = React.forwardRef<React.ElementRef<"div">, ApplicationStatusProps>(
  function ApplicationStatusComponent({ className, ...props }, ref) {
    return (
      <ClientOnly>
        <div
          {...props}
          className={cn(
            "flex items-center h-9 rounded-md border border-blue-900/40 bg-blue-950/30 text-sm px-4 mb-4 w-fit",
            className
          )}
          ref={ref}
        >
          <div className="flex gap-2 items-center">
            <span>Usuários registrados:</span>
            <UserRegistered />
          </div>
          <div className="h-full w-[1px] mx-4 bg-blue-900/40" />
          <div className="flex gap-2 items-center">
            <span>Contas registradas:</span>
            <SteamAccountsRegistered />
          </div>
          <div className="h-full w-[1px] mx-4 bg-blue-900/40" />
          <div className="flex gap-2 items-center">
            <span>Contas farmando no momento:</span>
            <FarmingAccountsAmount />
          </div>
        </div>
      </ClientOnly>
    )
  }
)

export function FarmingAccountsAmount() {
  const { data: farmingAccountsAmount } = useUserAdminList({
    select: userList =>
      userList.reduce((acc, item) => {
        for (const sa of item.steamAccounts) {
          if (sa.farmingGames.length) acc++
        }
        return acc
      }, 0),
  })
  return <p className="font-medium">{farmingAccountsAmount}</p>
}

export function UserRegistered() {
  const { data: usersRegistered } = useUserAdminList({
    select: userList => userList.map(user => user.id_user).length,
  })
  return <p className="font-medium">{usersRegistered}</p>
}

export function SteamAccountsRegistered() {
  const { data: steamAccountsRegistered } = useUserAdminList({
    select: userList => {
      return userList.reduce((acc, item) => {
        for (const _ of item.steamAccounts) {
          acc++
        }
        return acc
      }, 0)
    },
  })

  return <p className="font-medium">{steamAccountsRegistered}</p>
}

ApplicationStatus.displayName = "ApplicationStatus"
