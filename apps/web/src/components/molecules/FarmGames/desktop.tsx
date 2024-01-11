import { IconArrowClockwise } from "@/components/icons/IconArrowClockwise"
import { GameItem } from "@/components/molecules/GameItem"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import React from "react"
import { ChooseFarmingGamesViewProps } from "./types"
import { SteamAccountListItemContext } from "@/components/molecules/SteamAccountListItem/context"

type SheetChooseFarmingGamesViewProps = ChooseFarmingGamesViewProps

export const SheetChooseFarmingGamesView = React.forwardRef<
  React.ElementRef<"div">,
  SheetChooseFarmingGamesViewProps
>(function SheetChooseFarmingGamesViewComponent(
  { helpers, setOpen, open, children, className, ...props },
  ref
) {
  const { app } = React.useContext(SteamAccountListItemContext)
  const { accountName, games, farmingGames, id_steamAccount, profilePictureUrl } = app

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        {...props}
        className={cn("p-0 flex flex-col border-slate-800 h-screen", className)}
        ref={ref}
        side="right"
      >
        <SheetHeader className="py-6 px-4">
          <SheetTitle>{accountName} - Seus jogos</SheetTitle>
          <SheetDescription>Selecione os jogos que queira farmar e clique em salvar.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            onClick={helpers.handleStopFarm}
            className="flex-1 "
          >
            <span>Limpar farm</span>
          </Button>
          <Button
            onClick={helpers.handleRefreshGames}
            disabled={helpers.refreshGames.isPending}
            className="flex-1 relative"
          >
            <span>{helpers.refreshGames.isPending ? "Atualizando" : "Atualizar"}</span>
            {helpers.refreshGames.isPending && (
              <div className="absolute top-1/2 -translate-y-1/2 right-4">
                <IconArrowClockwise className="w-4 h-4 animate-spin" />
              </div>
            )}
          </Button>
        </div>
        <main className="flex-1 overflow-y-scroll pb-14">
          <div className="flex flex-col gap-2">
            {games ? (
              games.map(game => (
                <GameItem
                  key={game.id}
                  game={game}
                  handleFarmGame={() => helpers.handleFarmGame(game.id)}
                  isSelected={helpers.stageFarmingGames.includes(game.id)}
                />
              ))
            ) : (
              <span className="pt-6 px-4 text-slate-600">Nenhum jogo encontrado.</span>
            )}
          </div>
        </main>
        <SheetFooter className="absolute left-0 right-0 bottom-0 z-30 gap-2">
          <div className="absolute left-0 right-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
          <Button
            className="flex-1 relative disabled:opacity-70 z-40"
            onClick={helpers.handleFarmGames}
            disabled={helpers.farmGames.isPending || helpers.stopFarm.isPending}
          >
            <span>{helpers.farmGames.isPending || helpers.stopFarm.isPending ? "Salvando" : "Salvar"}</span>
            {(helpers.farmGames.isPending || helpers.stopFarm.isPending) && (
              <div className="absolute top-1/2 -translate-y-1/2 right-4">
                <IconArrowClockwise className="w-4 h-4 animate-spin" />
              </div>
            )}
          </Button>
          <Button
            className="flex-1 z-30"
            variant="destructive"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
})

SheetChooseFarmingGamesView.displayName = "SheetChooseFarmingGamesView"
