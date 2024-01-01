import { SteamAccountListItemContext } from "@/components/molecules/SteamAccountListItem"
import { useUser } from "@/contexts/UserContext"
import { cn } from "@/lib/utils"
import { GameSession } from "core"
import React, { useContext } from "react"

export type GameItemProps = React.ComponentPropsWithoutRef<"div"> & {
  game: GameSession
}

export const GameItem = React.forwardRef<React.ElementRef<"div">, GameItemProps>(function GameItemComponent(
  { game, className, ...props },
  ref
) {
  const user = useUser()
  const { farmingGames, accountName } = useContext(SteamAccountListItemContext)

  function handleFarmGame() {
    user.farmGame(
      {
        accountName,
        gameId: game.id,
      },
      ({ message }) => {
        alert(message)
      }
    )
  }

  return (
    <div
      {...props}
      className={cn("h-16 flex", className)}
      ref={ref}
    >
      <div
        className={cn(
          "w-4 shrink-0 border-r border-zinc-500",
          farmingGames.includes(game.id) ? "bg-green-500" : "bg-neutral-500"
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
