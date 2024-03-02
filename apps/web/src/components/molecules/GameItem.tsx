import { cn } from "@/lib/utils"
import { GameSession } from "core"
import React, { CSSProperties } from "react"

export type GameItemProps = React.ComponentPropsWithoutRef<"div"> & {
  game: GameSession
  isSelected?: boolean
  handleFarmGame(): void
  height?: `${number}rem`
}

export const GameItem = React.forwardRef<React.ElementRef<"div">, GameItemProps>(function GameItemComponent(
  { game, height = "8rem", className, isSelected, handleFarmGame, ...props },
  ref
) {
  return (
    <div
      {...props}
      className={cn("flex h-[var(--game-item-height)]", className)}
      ref={ref}
      style={
        {
          "--game-item-height": height,
        } as CSSProperties
      }
    >
      <div
        className={cn(
          "z-10 w-4 shrink-0 border-r",
          isSelected ? "border-green-600 bg-green-500" : "border-neutral-600 bg-neutral-500"
        )}
      />
      <button
        className="group relative flex-1 overflow-hidden [&_*]:transition-all [&_*]:duration-300"
        onClick={handleFarmGame}
      >
        <div className="absolute inset-0 z-[9] -translate-x-full bg-gradient-to-r from-black/80 to-transparent group-hover:translate-x-0" />
        <span className="absolute left-4 top-1/2 z-10 -translate-x-2 -translate-y-1/2 font-medium text-white opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
          {game.name}
        </span>
        <img
          src={game.imageUrl}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
          )}
        />
      </button>
    </div>
  )
})

GameItem.displayName = "GameItem"
