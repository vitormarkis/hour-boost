import { DrawerSheetChooseFarmingGames } from "@/components/molecules/drawer-sheet-choose-farming-games"
import { ModalAddSteamAccount } from "@/components/molecules/modal-add-steam-account"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { AccountSteamGameDTO } from "core"
import React from "react"

type SteamAccountStatusProps = {
  userId: string
  header?: boolean
  accountName: string
  maxGamesAllowed: number
  profilePictureUrl: string
  accountGames: AccountSteamGameDTO[]
}

type SteamAccountStatusLiveProps = {
  autoRestarter?: boolean
  isFarming?: boolean
  steamGuard?: boolean
  status: "offline" | "online"
  hoursFarmedInSeconds: number
  farmingTime: number
}

export function SteamAccountList(steamAccountStatusProps: SteamAccountStatusProps) {
  return (
    <SteamAccountListItemView
      {...steamAccountStatusProps}
      status="offline"
      hoursFarmedInSeconds={0}
      farmingTime={0}
    />
  )
}

export type SteamAccountListItemViewProps = SteamAccountStatusProps & SteamAccountStatusLiveProps

export const SteamAccountListItemView = React.forwardRef<
  React.ElementRef<"div">,
  SteamAccountListItemViewProps
>(function SteamAccountListItemViewComponent(s, ref) {
  return (
    <div
      className={cn("relative h-[4.5rem] border border-slate-800 flex", s.header && "mt-[4.5rem]")}
      ref={ref}
    >
      {s.header && (
        <div className="absolute left-4 bottom-full">
          <ModalAddSteamAccount userId={s.userId}>
            <Button className="rounded-t-md border-t border-x border-slate-800 bg-transparent text-white hover:bg-slate-800">
              Adicionar outra conta
            </Button>
          </ModalAddSteamAccount>
        </div>
      )}
      {s.isFarming && <div className="absolute top-0 bottom-0 right-full w-[0.25rem] bg-accent" />}
      <div className="flex items-center">
        {s.steamGuard ? (
          <button className="relative flex items-center h-full px-6 group">
            <div className="absolute inset-0 bg-slate-800 group-hover:animate-none animate-pulse" />
            <div className="relative z-10">
              <span className="absolute flex h-2 w-2 right-0 top-0 -translate-y-1/2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <SGVDeviceMobile className="h-5 w-5" />
            </div>
          </button>
        ) : (
          <div className="flex items-center h-full px-6">
            <SGVDeviceMobile className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="flex items-center pr-6 gap-4 overflow-hidden">
        <div className="h-[4.5rem] w-[4.5rem] relative">
          <img
            // src="https://avatars.cloudflare.steamstatic.com/2ec38f7a0953fe2585abdda0757324dbbb519749_full.jpg"
            src={s.profilePictureUrl}
            alt=""
            className="fillimg"
          />
        </div>
        <div className="leading-none flex flex-col">
          <strong>{s.accountName}</strong>
          <div className="text-xs">
            <span>Status: </span>
            <span className="text-slate-500">Offline</span>
          </div>
        </div>
      </div>
      <div className="relative flex items-center px-6 min-w-[8.5rem]">
        <div className="pr-2">
          <div className={cn("h-1.5 w-1.5 rounded-full bg-slate-500", s.isFarming && "bg-accent")} />
        </div>
        {s.header && (
          <div className="absolute bottom-full px-6 left-0 right-0 py-2">
            <span>farmando</span>
          </div>
        )}
        {s.isFarming ? (
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
        {s.header && (
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
      <DrawerSheetChooseFarmingGames accountGames={s.accountGames}>
        <button className="relative flex items-center px-6 group hover:bg-slate-700 transition-all duration-300">
          {s.header && (
            <div className="absolute bottom-full px-6 left-0 right-0 py-2">
              <span>jogos</span>
            </div>
          )}
          <div className="flex flex-col items-center">
            <span className="uppercase text-sm pb-1">1/{s.maxGamesAllowed}</span>
            <div className="flex items-center gap-1 h-6 ">
              <SVGJoystick className="transition-all duration-300 h-4 w-4 fill-slate-500 group-hover:fill-white" />
              <span className="transition-all duration-300 text-slate-500 group-hover:text-white">+</span>
            </div>
          </div>
        </button>
      </DrawerSheetChooseFarmingGames>
      <div className="flex items-center ml-auto">
        <div className="relative flex items-center h-full px-4">
          {s.header && (
            <div className="absolute bottom-full px-6 left-0 right-0 py-2">
              <span>auto-restarter</span>
            </div>
          )}
          <Switch size="1.25rem" />
        </div>
        <button className="flex items-center h-full px-4 hover:bg-slate-700">
          <SVGChart className="h-5 w-5 fill-white" />
        </button>
        <button className="flex items-center h-full px-4 hover:bg-slate-700">
          <SVGTrash className="h-5 w-5" />
        </button>
        {s.isFarming ? (
          <button className="flex items-center px-8 bg-accent h-full min-w-[10rem]">Farmando...</button>
        ) : (
          <button className="flex items-center px-8 bg-slate-800 h-full min-w-[10rem]">Começar farm</button>
        )}
      </div>
    </div>
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

export type SVGJoystickProps = React.ComponentPropsWithoutRef<"svg">

export function SVGJoystick({ className, ...props }: SVGJoystickProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
      className={cn("", className)}
    >
      <rect
        width={256}
        height={256}
        fill="none"
      />
      <path d="M247.44,173.75a.68.68,0,0,0,0-.14L231.05,89.44c0-.06,0-.12,0-.18A60.08,60.08,0,0,0,172,40H83.89a59.88,59.88,0,0,0-59,49.52L8.58,173.61a.68.68,0,0,0,0,.14,36,36,0,0,0,60.9,31.71l.35-.37L109.52,160h37l39.71,45.09c.11.13.23.25.35.37A36.08,36.08,0,0,0,212,216a36,36,0,0,0,35.43-42.25ZM104,112H96v8a8,8,0,0,1-16,0v-8H72a8,8,0,0,1,0-16h8V88a8,8,0,0,1,16,0v8h8a8,8,0,0,1,0,16Zm40-8a8,8,0,0,1,8-8h24a8,8,0,0,1,0,16H152A8,8,0,0,1,144,104Zm84.37,87.47a19.84,19.84,0,0,1-12.9,8.23A20.09,20.09,0,0,1,198,194.31L167.8,160H172a60,60,0,0,0,51-28.38l8.74,45A19.82,19.82,0,0,1,228.37,191.47Z" />
    </svg>
  )
}

export type SGVDeviceMobileProps = React.ComponentPropsWithoutRef<"svg">

export function SGVDeviceMobile({ className, ...props }: SGVDeviceMobileProps) {
  console.log(className)
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={cn("", className)}
    >
      <rect
        width={256}
        height={256}
        fill="none"
      />
      <rect
        x={64}
        y={24}
        width={128}
        height={208}
        rx={16}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={16}
      />
      <line
        x1={64}
        y1={56}
        x2={192}
        y2={56}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={16}
      />
      <line
        x1={64}
        y1={200}
        x2={192}
        y2={200}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={16}
      />
    </svg>
  )
}

export type SVGTrashProps = React.ComponentPropsWithoutRef<"svg">

export function SVGTrash({ className, ...props }: SVGTrashProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
      className={cn("", className)}
    >
      <rect
        width={256}
        height={256}
        fill="none"
      />
      <line
        x1={216}
        y1={60}
        x2={40}
        y2={60}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
      <line
        x1={104}
        y1={104}
        x2={104}
        y2={168}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
      <line
        x1={152}
        y1={104}
        x2={152}
        y2={168}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
      <path
        d="M200,60V208a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V60"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
      <path
        d="M168,60V36a16,16,0,0,0-16-16H104A16,16,0,0,0,88,36V60"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
    </svg>
  )
}

export type SVGChartProps = React.ComponentPropsWithoutRef<"svg">

export function SVGChart({ className, ...props }: SVGChartProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
      className={cn("", className)}
    >
      <rect
        width={256}
        height={256}
        fill="none"
      />
      <path d="M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1,0-16h8V136a8,8,0,0,1,8-8H72a8,8,0,0,1,8,8v64H96V88a8,8,0,0,1,8-8h32a8,8,0,0,1,8,8V200h16V40a8,8,0,0,1,8-8h40a8,8,0,0,1,8,8V200h8A8,8,0,0,1,232,208Z" />
    </svg>
  )
}
