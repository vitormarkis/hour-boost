import React from "react"
import { cn } from "@/lib/utils"
import { ChooseFarmingGamesViewProps } from "./types"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { SteamAccountListItemContext } from "@/components/molecules/SteamAccountListItem/context"
import { GameItem } from "@/components/molecules/GameItem"
import { IconArrowClockwise } from "@/components/icons/IconArrowClockwise"
import { ScrollArea } from "@/components/ui/scroll-area"

export type DrawerChooseFarmingGamesViewProps = ChooseFarmingGamesViewProps

export const DrawerChooseFarmingGamesView = React.forwardRef<
  React.ElementRef<"div">,
  DrawerChooseFarmingGamesViewProps
>(function DrawerChooseFarmingGamesViewComponent({ helpers, open, setOpen, children, className }, ref) {
  const { app } = React.useContext(SteamAccountListItemContext)
  const { accountName, games, farmingGames, id_steamAccount, profilePictureUrl } = app
  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="py-6 px-4">
          <DrawerTitle>{accountName} - Seus jogos</DrawerTitle>
          <DrawerDescription>Selecione os jogos que queira farmar e clique em salvar.</DrawerDescription>
        </DrawerHeader>
        <main className="flex-1 overflow-y-scroll">
          <ScrollArea className="h-[45vh] rounded-sm px-4">
            <div className="flex flex-col gap-2">
              {games ? (
                games.map(game => (
                  <GameItem
                    height="5rem"
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
          </ScrollArea>
        </main>
        <DrawerFooter className="pt-4">
          <Button
            className="h-16 flex-1 relative disabled:opacity-70 z-40"
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
            className="h-16 flex-1 z-30"
            variant="destructive"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
})

DrawerChooseFarmingGamesView.displayName = "DrawerChooseFarmingGamesView"
