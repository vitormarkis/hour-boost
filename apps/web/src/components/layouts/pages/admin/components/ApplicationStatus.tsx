import React from "react"
import { cn } from "@/lib/utils"
import { useUserAdminList } from "../hooks/useUserAdminList"

export type ApplicationStatusProps = React.ComponentPropsWithoutRef<"div"> & {}

export const ApplicationStatus = React.forwardRef<React.ElementRef<"div">, ApplicationStatusProps>(
  function ApplicationStatusComponent({ className, ...props }, ref) {
    return (
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
          <p className="font-medium">
            <UserRegistered />
          </p>
        </div>
        <i className="h-full w-[1px] mx-4 bg-blue-900/40" />
        <div className="flex gap-2 items-center">
          <span>Contas registradas:</span>
          <p className="font-medium">
            <SteamAccountsRegistered />
          </p>
        </div>
        <i className="h-full w-[1px] mx-4 bg-blue-900/40" />
        <div className="flex gap-2 items-center">
          <span>Contas farmando no momento:</span>
          <p className="font-medium">
            <FarmingAccountsAmount />
          </p>
        </div>
      </div>
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
  return farmingAccountsAmount
}

export function UserRegistered() {
  const { data: usersRegistered } = useUserAdminList({
    select: userList => userList.map(user => user.id_user).length,
  })
  return usersRegistered
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

  return steamAccountsRegistered
}

ApplicationStatus.displayName = "ApplicationStatus"
