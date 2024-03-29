import { IconPullRequest } from "@/components/icons/IconPullRequest"
import { ModalAddSteamAccount } from "@/components/molecules/ModalAddSteamAccount/controller"
import { SteamAccountList as SteamAccountListComp } from "@/components/molecules/SteamAccountListItem"
import { ZustandSteamAccountStoreProvider } from "@/components/molecules/SteamAccountListItem/store/useSteamAccountStore"
import { Button } from "@/components/ui/button"
import { useUser } from "@/contexts/UserContext"
import { useUserControl } from "@/contexts/hook"
import { cn } from "@/lib/utils"
import React from "react"

const SteamAccountList = React.memo(SteamAccountListComp)

export type DashboardSteamAccountsListProps = React.ComponentPropsWithoutRef<"section"> & {}
export const DashboardSteamAccountsList = React.forwardRef<
  React.ElementRef<"section">,
  DashboardSteamAccountsListProps
>(function DashboardSteamAccountsListComponent({ className, ...props }, ref) {
  const hasAccounts = useUserControl(user => user.hasAccounts)
  const plan = useUser(user => user.plan)
  const steamAccounts = useUser(user => user.steamAccounts)

  return (
    <section
      {...props}
      className={cn("mdx:gap-2 mdx:p-2 flex flex-col gap-16", className)}
      ref={ref}
    >
      {hasAccounts ? (
        <>
          {steamAccounts.map((app, index) => (
            <ZustandSteamAccountStoreProvider
              key={app.id_steamAccount}
              initialState={{
                localStagingFarm_list: app.stagingGames,
                stageFarmingGames_list: app.stagingGames,
                urgent: false, // desnecessario
                modalOpen_desktop: false,
                autoRelogin: app.autoRelogin,
                filterInputLocalStaging: "", // desnecessario
              }}
              contextInfo={{
                planMaxGamesAllowed: plan.maxGamesAllowed,
              }}
            >
              <SteamAccountList
                key={app.id_steamAccount}
                app={app}
                status={{
                  maxGamesAllowed: plan.maxGamesAllowed,
                  header: index === 0,
                }}
              />
            </ZustandSteamAccountStoreProvider>
          ))}
          <div className="pb-16" />
        </>
      ) : (
        <div className="grid h-full w-full place-items-center">
          <div className="flex items-center px-16 py-12 md:px-0">
            <h1 className="mdx:text-[2.6rem] h-fit w-fit text-center text-[2.6rem] font-bold leading-none text-slate-600/80 md:text-right md:text-[2rem]">
              Você não possui contas no momento...
            </h1>
            <div className="hidden md:block">
              <IconPullRequest className="ml-4 w-[3.5rem] fill-slate-600/80" />
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
