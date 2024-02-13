import React from "react"
import { cn } from "@/lib/utils"

export type SteamAccountAdminNoSteamAccountsProps = React.ComponentPropsWithoutRef<"div"> & {}

export const SteamAccountAdminNoSteamAccounts = React.forwardRef<
  React.ElementRef<"div">,
  SteamAccountAdminNoSteamAccountsProps
>(function SteamAccountAdminNoSteamAccountsComponent({ className, ...props }, ref) {
  return (
    <div
      {...props}
      className={cn("flex justify-center items-center", className)}
      ref={ref}
    >
      <div className="py-4">
        <h3 className="font-medium text-slate-500">Usuário ainda não adicionou contas</h3>
      </div>
    </div>
  )
})

SteamAccountAdminNoSteamAccounts.displayName = "SteamAccountAdminNoSteamAccounts"
