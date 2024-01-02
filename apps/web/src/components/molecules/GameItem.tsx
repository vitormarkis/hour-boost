import { SteamAccountListItemContext } from "@/components/molecules/SteamAccountListItem"
import { useUser } from "@/contexts/UserContext"
import { cn } from "@/lib/utils"
import { GameSession } from "core"
import React, { useContext } from "react"

export type GameItemProps = React.ComponentPropsWithoutRef<"div"> & {
  game: GameSession
  isSelected?: boolean
  handleFarmGame(): void
}

export const GameItem = React.forwardRef<React.ElementRef<"div">, GameItemProps>(function GameItemComponent(
  { game, className, isSelected, handleFarmGame, ...props },
  ref
) {
  return (
    <div
      {...props}
      className={cn("h-20 flex", className)}
      ref={ref}
    >
      <div
        className={cn(
          "w-4 shrink-0 border-r z-10",
          isSelected ? "bg-green-500 border-green-600" : "bg-neutral-500 border-neutral-600"
        )}
      />
      <button
        className="flex-1 relative overflow-hidden group [&_*]:transition-all [&_*]:duration-300"
        onClick={handleFarmGame}
      >
        <div className="absolute inset-0 bg-gradient-to-r z-[9] from-black/80 to-transparent -translate-x-full group-hover:translate-x-0" />
        <span className="absolute z-10 left-4 top-1/2 -translate-y-1/2 text-white font-medium -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0">
          {game.name}
        </span>
        <img
          src={game.imageUrl}
          className="h-full w-full absolute inset-0 object-cover group-hover:scale-105 transition-all duration-500"
        />
      </button>
    </div>
  )
})

GameItem.displayName = "GameItem"
