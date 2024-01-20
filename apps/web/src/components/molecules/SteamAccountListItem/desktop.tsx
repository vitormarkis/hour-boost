import { TimeSince } from "@/components/atoms/TimeSince"
import { IconChart } from "@/components/icons/IconChart"
import { IconDeviceMobile } from "@/components/icons/IconDeviceMobile"
import { IconSpinner } from "@/components/icons/IconSpinner"
import { IconTrash } from "@/components/icons/IconTrash"
import { MenuDropdownChangeAccountStatus } from "@/components/molecules/ChangeAccountStatus/components"
import { ChooseFarmingGames } from "@/components/molecules/FarmGames/controller"
import { AlertDialogRemoveSteamAccount } from "@/components/molecules/RemoveSteamAccount/components/controller"
import { Switch } from "@/components/ui/switch"
import { IMG_USER_PLACEHOLDER } from "@/consts"
import { useUser } from "@/contexts/UserContext"
import { cn } from "@/lib/utils"
import { Message } from "@/util/DataOrMessage"
import { showToastFarmingGame } from "@/util/toaster"
import React from "react"
import { toast } from "sonner"
import twc from "tailwindcss/colors"
import { ButtonAddNewAccount } from "./components"
import { useSteamAccountListItem } from "./context"
import { SteamAccountListItemViewProps } from "./types"

type SteamAccountListItemViewDesktopProps = SteamAccountListItemViewProps

export const SteamAccountListItemViewDesktop = React.memo(
  React.forwardRef<React.ElementRef<"div">, SteamAccountListItemViewDesktopProps>(
    function SteamAccountListItemViewDesktopComponent({ handleClickFarmButton, actionText }, ref) {
      const { header, steamGuard, app, mutations, hasUsagePlanLeft, isFarming, status } =
        useSteamAccountListItem()
      const { accountName, profilePictureUrl, farmStartedAt } = app
      const plan = useUser(u => u.plan)

      const handleClickFarmButtonImpl = async () => {
        const [undesired, payload] = await handleClickFarmButton()
        if (undesired) return toast[undesired.type](undesired.message)
        if (payload instanceof Message) return toast[payload.type](payload.message)
        const { games, list } = payload
        showToastFarmingGame(list, games)
      }

      // const farmedTimeSince = getFarmedTimeSince(app.farmedTimeInSeconds)

      return (
        <div
          className={cn("relative h-[4.5rem] border border-slate-800 flex", header && "mt-[4.5rem]")}
          ref={ref}
        >
          {header && (
            <div className="absolute left-4 bottom-full">
              <ButtonAddNewAccount />
            </div>
          )}
          {isFarming() && (
            <div className="absolute top-0 bottom-0 right-full w-[0.25rem] bg-accent animate-pulse" />
          )}
          <div className="flex items-center">
            {steamGuard ? (
              <button className="relative flex items-center h-full px-6 group">
                <div className="absolute inset-0 bg-slate-800 group-hover:animate-none animate-pulse" />
                <div className="relative z-10">
                  <span className="absolute flex h-2 w-2 right-0 top-0 -translate-y-1/2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <IconDeviceMobile className="h-5 w-5" />
                </div>
              </button>
            ) : (
              <div className="flex items-center h-full px-6">
                <IconDeviceMobile className="h-5 w-5" />
              </div>
            )}
          </div>
          <div className="flex items-center pr-6 gap-4 overflow-hidden max-w-[19rem] w-full">
            <div className="h-[4.5rem] w-[4.5rem] relative shrink-0">
              <img
                // src="https://avatarcloudflare.steamstatic.com/2ec38f7a0953fe2585abdda0757324dbbb519749_full.jpg"
                src={profilePictureUrl ?? IMG_USER_PLACEHOLDER}
                alt=""
                className="fillimg"
              />
            </div>
            <div className="leading-none flex flex-col">
              <strong>{accountName}</strong>
              <div className="text-xs flex gap-1 items-center mt-1 ">
                <MenuDropdownChangeAccountStatus>
                  <button
                    disabled={mutations.changeAccountStatus.isPending}
                    className="disabled:cursor-not-allowed focus:outline-none flex items-center"
                  >
                    <div
                      className={cn(
                        "h-1 w-1 rounded-full mr-1.5 bg-slate-500",
                        status === "online" && "bg-green-500"
                      )}
                    />
                    <span
                      className={cn(
                        "text-slate-300 select-none cursor-pointer hover:underline pr-2 -translate-y-[2px]",
                        status === "offline" && "text-slate-500"
                      )}
                    >
                      {status}
                    </span>
                    {mutations.changeAccountStatus.isPending && (
                      <div className="-translate-y-[1px]">
                        <IconSpinner
                          color={twc.blue["500"]}
                          className="h-3 w-3"
                        />
                      </div>
                    )}
                  </button>
                </MenuDropdownChangeAccountStatus>
              </div>
            </div>
          </div>
          <div className="relative flex items-center px-6 min-w-[8.5rem]">
            <div className="pr-2">
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full bg-slate-500",
                  isFarming() && "bg-accent animate-pulse"
                )}
              />
            </div>
            {header && (
              <div className="absolute bottom-full px-6 left-0 right-0 py-2">
                <span>farmando</span>
              </div>
            )}
            {isFarming() ? (
              <div className="flex flex-col justify-center h-full leading-none">
                {/* <span className="uppercase">2.5 horas</span> */}
                {/* <span className="text-sm text-slate-500">153 min</span> */}
                {farmStartedAt ? (
                  <TimeSince.Root date={farmStartedAt}>
                    <TimeSince.HighlightTime className="text-sm" />
                    <TimeSince.SecondaryTime className="text-xs" />
                  </TimeSince.Root>
                ) : (
                  <span>Sem informações do farm</span>
                )}
              </div>
            ) : (
              <div className="flex flex-col justify-center h-full leading-none">
                <span className="text-slate-500">0 horas</span>
              </div>
            )}
          </div>
          <div className="relative flex items-center px-6 group cursor-default whitespace-nowrap min-w-[8.5rem]">
            {header && (
              <div className="absolute bottom-full px-6 left-0 right-0 py-2">
                <span>
                  horas
                  <br />
                  farmadas
                </span>
              </div>
            )}
            <div className="flex flex-col mx-auto">
              <div className="flex relative tabular-nums">
                <div className="flex gap-1 leading-none font-medium whitespace-nowrap text-sm">
                  {(app.farmedTimeInSeconds / 60 / 60).toFixed(2)}
                  <span className="text-slate-600">horas</span>
                </div>
                {/* <div className="absolute top-full">
              <span className="pt-0.5 leading-none text-xs text-slate-500 whitespace-nowrap">
                {farmedTimeSince.secondaryTime}
              </span>
            </div> */}
              </div>
              {/* <span className="leading-none text-[0.75rem]/[0.75rem] text-slate-500">nessa conta</span> */}
            </div>
          </div>
          <div className="relative flex items-center ">
            {header && (
              <div className="absolute bottom-full px-6 left-0 right-0 py-2">
                <span>jogos</span>
              </div>
            )}

            <ChooseFarmingGames />
          </div>
          <div className="flex items-center ml-auto">
            {plan.autoRestarter ? (
              <div className="relative flex items-center h-full px-4">
                {header && (
                  <div className="absolute bottom-full px-6 left-0 right-0 py-2">
                    <span>auto-restarter</span>
                  </div>
                )}
                <Switch size="1.25rem" />
              </div>
            ) : null}
            <button className="flex items-center h-full px-4 hover:bg-slate-700 transition-all duration-300">
              <IconChart className="h-5 w-5 fill-white" />
            </button>
            <AlertDialogRemoveSteamAccount steamAccount={app}>
              <button className="flex items-center h-full px-4 hover:bg-slate-700 transition-all duration-300">
                <IconTrash className="h-5 w-5" />
              </button>
            </AlertDialogRemoveSteamAccount>
            <button
              disabled={mutations.farmGames.isPending || mutations.stopFarm.isPending || !hasUsagePlanLeft()}
              className={cn(
                "flex justify-center text-white items-center px-8 h-full min-w-[12.6rem] bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:cursor-not-allowed",
                isFarming() && "bg-accent hover:bg-accent-500 disabled:bg-accent-700"
              )}
              onClick={handleClickFarmButtonImpl}
            >
              {hasUsagePlanLeft() ? actionText : "Seu plano acabou"}
            </button>
          </div>
        </div>
      )
    }
  )
)

// PROGRESS BAR
{
  /* <div className="flex items-center gap-2 ">
  <div className="h-1 w-full flex items-center bg-slate-700">
    <div className="h-full relative bg-accent w-[40%]">
      <div className="absolute right-0 top-full translate-x-1/2 opacity-0 group-hover:opacity-100 transition-[opacity] duration-300">
        <i className="absolute left-1/2 top-0 translate-x-[-1px] border-r border-accent h-[0.25rem]" />
        <span className="text-sm">40%</span>
      </div>
    </div>
  </div>
</div> */
}

SteamAccountListItemViewDesktop.displayName = "SteamAccountListItem"
