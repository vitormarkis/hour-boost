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
      className={cn("h-16 flex", className)}
      ref={ref}
    >
      <div
        className={cn(
          "w-4 shrink-0 border-r border-zinc-500",
          isSelected ? "bg-green-500" : "bg-neutral-500"
        )}
      />
      <button
        className="flex-1 relative"
        onClick={handleFarmGame}
      >
        <img
          src={game.imageUrl}
          className="h-full w-full absolute inset-0 object-cover"
        />
      </button>
    </div>
  )
})

GameItem.displayName = "GameItem"
