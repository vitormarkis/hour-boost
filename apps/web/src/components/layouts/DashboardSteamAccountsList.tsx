import { IconPullRequest } from "@/components/icons/IconPullRequest"
import { ModalAddSteamAccount } from "@/components/molecules/ModalAddSteamAccount/controller"
import { SteamAccountList as SteamAccountListComp } from "@/components/molecules/SteamAccountListItem"
import { ZustandSteamAccountStoreProvider } from "@/components/molecules/SteamAccountListItem/store/useSteamAccountStore"
import { Button } from "@/components/ui/button"
import { useUser } from "@/contexts/UserContext"
import { cn } from "@/lib/utils"
import React from "react"

const SteamAccountList = React.memo(SteamAccountListComp)

export type DashboardSteamAccountsListProps = React.ComponentPropsWithoutRef<"section"> & {}
export const DashboardSteamAccountsList = React.forwardRef<
  React.ElementRef<"section">,
  DashboardSteamAccountsListProps
>(function DashboardSteamAccountsListComponent({ className, ...props }, ref) {
  const { hasAccounts, plan, steamAccounts } = useUser()

  return (
    <section
      {...props}
      className={cn("flex flex-col gap-16 mdx:gap-2 mdx:p-2", className)}
      ref={ref}
    >
      {hasAccounts() ? (
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
        <div className="w-full h-full grid place-items-center">
          <div className="py-12 flex items-center px-16 md:px-0">
            <h1 className="font-bold w-fit h-fit text-[2.6rem] md:text-[2rem] mdx:text-[2.6rem] leading-none text-center md:text-right text-slate-600/80">
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
