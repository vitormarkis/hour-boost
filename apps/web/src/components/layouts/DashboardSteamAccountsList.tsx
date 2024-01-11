import { IconPullRequest } from "@/components/icons/IconPullRequest"
import { ModalAddSteamAccount } from "@/components/molecules/ModalAddSteamAccount/controller"
import { SteamAccountList } from "@/components/molecules/SteamAccountListItem"
import { Button } from "@/components/ui/button"
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
      className={cn("flex flex-col gap-16 mdx:gap-2 mdx:p-2", className)}
      ref={ref}
    >
      {user.hasAccounts() ? (
        <>
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
          <div className="pb-16" />
        </>
      ) : (
        <div className="w-full h-full grid place-items-center">
          <div className="py-12 flex items-center">
            <h1 className="font-bold w-fit h-fit text-[2.6rem]/none text-right text-slate-600/80">
              Você não possui contas no momento...
            </h1>
            <div>
              <IconPullRequest className="w-[3.5rem] fill-slate-600/80" />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <ModalAddSteamAccount>
              <Button size="lg">Adicionar conta</Button>
            </ModalAddSteamAccount>
          </div>
        </div>
      )}
    </section>
  )
})

DashboardSteamAccountsList.displayName = "DashboardSteamAccountsList"
