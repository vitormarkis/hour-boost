import { cn } from "@/lib/utils"
import React from "react"

export type SteamAccountListHeaderProps = React.ComponentPropsWithoutRef<"div"> & {}

export const SteamAccountListHeader = React.forwardRef<React.ElementRef<"div">, SteamAccountListHeaderProps>(
  function SteamAccountListHeaderComponent({ className, ...props }, ref) {
    return (
      <div
        {...props}
        className={cn("relative h-11 border border-slate-800 flex", className)}
        ref={ref}
      >
        <div className="absolute top-0 bottom-0 right-full w-[0.25rem] bg-green-500" />
        <div className="flex items-center">
          <div className="flex items-center h-full px-4">
            <SGVDeviceMobile className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-center pr-4 gap-4">
          <div className="h-11 w-11 relative">
            <img
              src="https://avatars.cloudflare.steamstatic.com/2ec38f7a0953fe2585abdda0757324dbbb519749_full.jpg"
              alt=""
              className="fillimg"
            />
          </div>
          <strong>Tiber Brutus</strong>
        </div>
        <div className="flex items-center px-4">Farmando: 3h 22m...</div>
        <div className="flex items-center px-4">Horas ganhas: 23h</div>
        <div className="flex items-center px-4">Jogos: 1/2</div>
        <div className="flex items-center ml-auto">
          <button className="flex items-center h-full px-4 hover:bg-slate-700">
            <SVGChart className="h-4 w-4 fill-white" />
          </button>
          <button className="flex items-center h-full px-4 hover:bg-slate-700">
            <SVGTrash className="h-4 w-4" />
          </button>
          <button className="flex items-center px-8 bg-slate-800 h-full">Começar farm</button>
        </div>
      </div>
    )
  }
)

SteamAccountListHeader.displayName = "SteamAccountListHeader"

export type SGVDeviceMobileProps = React.ComponentPropsWithoutRef<"svg">

export function SGVDeviceMobile({ className, ...props }: SGVDeviceMobileProps) {
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
