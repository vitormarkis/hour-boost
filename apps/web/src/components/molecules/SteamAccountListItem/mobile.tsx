import { TimeSince } from "@/components/atoms/TimeSince"
import { IconChart } from "@/components/icons/IconChart"
import { IconDeviceMobile } from "@/components/icons/IconDeviceMobile"
import { IconJoystick } from "@/components/icons/IconJoystick"
import { IconTrash } from "@/components/icons/IconTrash"
import { DrawerSheetChooseFarmingGames } from "@/components/molecules/FarmGames/controller"
import { AlertDialogRemoveSteamAccount } from "@/components/molecules/RemoveSteamAccount/components/controller"
import { Switch } from "@/components/ui/switch"
import { IMG_USER_PLACEHOLDER } from "@/consts"
import { cn } from "@/lib/utils"
import { useUser } from "@clerk/clerk-react"
import React, { CSSProperties } from "react"
import { ButtonAddNewAccount } from "./components"
import { useSteamAccountListItem } from "./context"

type SteamAccountListItemViewMobileProps = {}

export const SteamAccountListItemViewMobile = React.forwardRef<
  React.ElementRef<"div">,
  SteamAccountListItemViewMobileProps
>(function SteamAccountListItemViewMobileComponent(props, ref) {
  const {
    farmingTime,
    hoursFarmedInSeconds,
    maxGamesAllowed,
    autoRestarter,
    status,
    header,
    steamGuard,
    app,
  } = useSteamAccountListItem()
  const { accountName, games, id_steamAccount, profilePictureUrl, farmingGames, farmStartedAt } = app
  const user = useUser()
  const isFarming = farmingGames.length > 0

  return (
    <div
      className={cn("relative flex flex-col border-t border-slate-800", header && "mt-[4.5rem]")}
      ref={ref}
    >
      {header && (
        <div className="absolute left-4 bottom-full">
          <ButtonAddNewAccount />
        </div>
      )}
      <div className="flex items-center gap-4 overflow-hidden">
        <div className="flex">
          {isFarming && <div className="h-[4.5rem] w-[0.25rem] bg-accent animate-pulse" />}
          <div className={cn("h-[4.5rem] w-[4.5rem] relative shrink-0")}>
            <img
              // src="https://avatarcloudflare.steamstatic.com/2ec38f7a0953fe2585abdda0757324dbbb519749_full.jpg"
              src={profilePictureUrl ?? IMG_USER_PLACEHOLDER}
              alt=""
              className="fillimg"
            />
          </div>
        </div>
        <div className="leading-none flex flex-col grow">
          <strong className="text-lg">{accountName}</strong>
          <div className="text-xs">
            <span>Status: </span>
            <span className="text-slate-500">Offline</span>
          </div>
        </div>
        <div className="flex items-center">
          {steamGuard ? (
            <button className="relative flex items-center h-full group">
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
      </div>
      <ul
        className="flex flex-col pt-3 px-4 gap-1"
        style={
          {
            "--propertiesWidth": "7.2rem",
          } as CSSProperties
        }
      >
        <li className="flex items-center  min-h-[2rem]">
          <span className="pr-3 w-[var(--propertiesWidth)]">Farmando:</span>
          <div className="pr-3">
            <div
              className={cn("h-1.5 w-1.5 rounded-full bg-slate-500", isFarming && "bg-accent animate-pulse")}
            />
          </div>
          <div className="">
            {isFarming ? (
              <div className="flex flex-col justify-center h-full leading-none">
                {farmStartedAt ? (
                  <TimeSince.Root
                    className="items-end gap-2"
                    date={farmStartedAt}
                  >
                    <TimeSince.HighlightTime />
                    <TimeSince.SecondaryTime suspense={false} />
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
        </li>
        <li className="flex items-center  min-h-[2rem]">
          <span className="pr-3 w-[var(--propertiesWidth)]">Horas ganhas:</span>
          <div className="flex flex-col justify-center h-full leading-none">
            <span className="text-slate-500">0 horas</span>
          </div>
        </li>
        <li className="flex items-center  min-h-[2rem]">
          <span className="pr-3 w-[var(--propertiesWidth)]">Auto restart:</span>
          <div className="flex flex-col justify-center h-full leading-none">
            <Switch size="1.25rem" />
          </div>
        </li>
      </ul>
      <ul className="flex h-24">
        <li>
          <button className="flex items-center h-full px-4 hover:bg-slate-700 transition-[background-color] duration-300">
            <IconChart className="h-5 w-5 fill-white" />
          </button>
        </li>
        <li>
          <AlertDialogRemoveSteamAccount steamAccount={app}>
            <button className="flex items-center h-full px-4 hover:bg-slate-700 transition-[background-color] duration-300">
              <IconTrash className="h-5 w-5" />
            </button>
          </AlertDialogRemoveSteamAccount>
        </li>
        <i className="my-auto h-1/2 border-r border-slate-700" />
        <li className="ml-auto">
          <DrawerSheetChooseFarmingGames>
            <button className="relative py-2 flex items-center px-6 group hover:bg-slate-700 transition-[background-color] duration-300 h-full">
              <div className="flex flex-col items-end">
                <strong className="pb-0.5">Jogos</strong>
                <div className="flex items-center gap-2 h-6 ">
                  <span className="uppercase text-sm">
                    {farmingGames.length}/{maxGamesAllowed}
                  </span>
                  <IconJoystick className="transition-[background-color] duration-300 h-4 w-4 fill-slate-500 group-hover:fill-white" />
                  <span className="transition-[background-color] duration-300 text-slate-500 group-hover:text-white">
                    +
                  </span>
                </div>
              </div>
            </button>
          </DrawerSheetChooseFarmingGames>
        </li>
      </ul>
      <div>
        {isFarming ? (
          <button className="flex items-center justify-center px-8 bg-accent h-20 w-full text-lg font-medium">
            Parar farm
          </button>
        ) : (
          <button className="flex items-center justify-center px-8 bg-slate-800 h-20 w-full text-lg font-medium">
            Começar farm
          </button>
        )}
      </div>
    </div>
  )
})

SteamAccountListItemViewMobile.displayName = "SteamAccountListItemViewMobile"
