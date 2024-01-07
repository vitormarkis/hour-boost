import { IconChart } from "@/components/icons/IconChart"
import { IconDeviceMobile } from "@/components/icons/IconDeviceMobile"
import { IconJoystick } from "@/components/icons/IconJoystick"
import { IconTrash } from "@/components/icons/IconTrash"
import { DrawerSheetChooseFarmingGames } from "@/components/molecules/FarmGames/controller"
import { ModalAddSteamAccount } from "@/components/molecules/ModalAddSteamAccount/controller"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { IMG_USER_PLACEHOLDER } from "@/consts"
import { useUser } from "@/contexts/UserContext"
import { cn } from "@/lib/utils"
import { SteamAccountSession } from "core"
import React from "react"

type SteamAccountStatusProps = {
  header?: boolean
  maxGamesAllowed: number
}

type SteamAccountAppProps = SteamAccountSession

type SteamAccountStatusLiveProps = {
  autoRestarter?: boolean
  isFarming?: boolean
  steamGuard?: boolean
  status: "offline" | "online"
  hoursFarmedInSeconds: number
  farmingTime: number
}

export function SteamAccountList({
  app,
  status,
}: {
  status: SteamAccountStatusProps
  app: SteamAccountAppProps
}) {
  return (
    <SteamAccountListItemView
      {...app}
      {...status}
      status="offline"
      hoursFarmedInSeconds={0}
      farmingTime={0}
    />
  )
}

interface ISteamAccountListItemContext
  extends SteamAccountStatusProps,
    SteamAccountStatusLiveProps,
    SteamAccountAppProps {}

export const SteamAccountListItemContext = React.createContext({} as ISteamAccountListItemContext)

export const SteamAccountListItemView = React.forwardRef<
  React.ElementRef<"div">,
  ISteamAccountListItemContext
>(function SteamAccountListItemViewComponent(props, ref) {
  const {
    accountName,
    farmingTime,
    games,
    hoursFarmedInSeconds,
    id_steamAccount,
    maxGamesAllowed,
    profilePictureUrl,
    status,
    autoRestarter,
    header,
    isFarming,
    farmingGames,
    steamGuard,
  } = props
  const user = useUser()
  console.log(user)

  return (
    <SteamAccountListItemContext.Provider value={props}>
      <div
        className={cn("relative h-[4.5rem] border border-slate-800 flex", header && "mt-[4.5rem]")}
        ref={ref}
      >
        {header && (
          <div className="absolute left-4 bottom-full">
            <ModalAddSteamAccount>
              <Button className="rounded-t-md border-t border-x border-slate-800 bg-transparent text-white hover:bg-slate-800">
                Adicionar outra conta
              </Button>
            </ModalAddSteamAccount>
          </div>
        )}
        {isFarming && <div className="absolute top-0 bottom-0 right-full w-[0.25rem] bg-accent" />}
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
        <div className="flex items-center pr-6 gap-4 overflow-hidden">
          <div className="h-[4.5rem] w-[4.5rem] relative">
            <img
              // src="https://avatarcloudflare.steamstatic.com/2ec38f7a0953fe2585abdda0757324dbbb519749_full.jpg"
              src={profilePictureUrl ?? IMG_USER_PLACEHOLDER}
              alt=""
              className="fillimg"
            />
          </div>
          <div className="leading-none flex flex-col">
            <strong>{accountName}</strong>
            <div className="text-xs">
              <span>Status: </span>
              <span className="text-slate-500">Offline</span>
            </div>
          </div>
        </div>
        <div className="relative flex items-center px-6 min-w-[8.5rem]">
          <div className="pr-2">
            <div className={cn("h-1.5 w-1.5 rounded-full bg-slate-500", isFarming && "bg-accent")} />
          </div>
          {header && (
            <div className="absolute bottom-full px-6 left-0 right-0 py-2">
              <span>farmando</span>
            </div>
          )}
          {isFarming ? (
            <div className="flex flex-col justify-center h-full leading-none">
              <span className="uppercase">2.5 horas</span>
              <span className="text-sm text-slate-500">153 min</span>
            </div>
          ) : (
            <div className="flex flex-col justify-center h-full leading-none">
              <span className="text-slate-500">0 horas</span>
            </div>
          )}
        </div>
        <div className="relative flex items-center px-10 group cursor-default whitespace-nowrap">
          {header && (
            <div className="absolute bottom-full px-6 left-0 right-0 py-2">
              <span>horas ganhas</span>
            </div>
          )}
          <div className="flex flex-col">
            <div className="">
              <span className="leading-none text-[1rem]/[1rem]">{(5000 / 60 / 1000).toFixed(2)} </span>
              <span className="leading-none text-[0.875rem]/[0.875rem]">horas</span>
              {/* <span className="inline-block text-sm px-2">/</span>
              <span className="text-normal">6 </span>
              <span className="text-sm">horas</span> */}
            </div>
            <span className="leading-none text-[0.75rem]/[0.75rem] text-slate-500">nessa conta</span>
          </div>
        </div>
        <DrawerSheetChooseFarmingGames>
          <button className="relative flex items-center px-6 group hover:bg-slate-700 transition-all duration-300">
            {header && (
              <div className="absolute bottom-full px-6 left-0 right-0 py-2">
                <span>jogos</span>
              </div>
            )}
            <div className="flex flex-col items-center">
              <span className="uppercase text-sm pb-1">
                {farmingGames.length}/{maxGamesAllowed}
              </span>
              <div className="flex items-center gap-1 h-6 ">
                <IconJoystick className="transition-all duration-300 h-4 w-4 fill-slate-500 group-hover:fill-white" />
                <span className="transition-all duration-300 text-slate-500 group-hover:text-white">+</span>
              </div>
            </div>
          </button>
        </DrawerSheetChooseFarmingGames>
        <div className="flex items-center ml-auto">
          <div className="relative flex items-center h-full px-4">
            {header && (
              <div className="absolute bottom-full px-6 left-0 right-0 py-2">
                <span>auto-restarter</span>
              </div>
            )}
            <Switch size="1.25rem" />
          </div>
          <button className="flex items-center h-full px-4 hover:bg-slate-700">
            <IconChart className="h-5 w-5 fill-white" />
          </button>
          <button className="flex items-center h-full px-4 hover:bg-slate-700">
            <IconTrash className="h-5 w-5" />
          </button>
          {isFarming ? (
            <button className="flex items-center px-8 bg-accent h-full min-w-[10rem]">Farmando...</button>
          ) : (
            <button className="flex items-center px-8 bg-slate-800 h-full min-w-[10rem]">Começar farm</button>
          )}
        </div>
      </div>
    </SteamAccountListItemContext.Provider>
  )
})

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

SteamAccountListItemView.displayName = "SteamAccountListItem"
