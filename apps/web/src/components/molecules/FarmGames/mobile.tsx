import { IconArrowClockwise } from "@/components/icons/IconArrowClockwise"
import { GameItem } from "@/components/molecules/GameItem"
import { useSteamAccountListItem } from "@/components/molecules/SteamAccountListItem/context"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import React from "react"
import { useFarmGames } from "./context"
import { local_useSteamAccountListItem } from "./controller"

export function DrawerChooseFarmingGamesView({ children }: React.PropsWithChildren) {
  const { state, helpers } = useFarmGames()
  const local = local_useSteamAccountListItem.farmGames()
  const { stagingFarmGames } = useSteamAccountListItem()
  const [open, setOpen] = state

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="py-6 px-4">
          <DrawerTitle>{local.accountName} - Seus jogos</DrawerTitle>
          <DrawerDescription>Selecione os jogos que queira farmar e clique em salvar.</DrawerDescription>
        </DrawerHeader>
        <main className="flex-1 overflow-y-scroll">
          <ScrollArea className="h-[65vh] rounded-sm px-2">
            <div className="flex flex-col gap-2">
              {local.games ? (
                local.games.map(game => (
                  <GameItem
                    height="9rem"
                    key={game.id}
                    game={game}
                    handleFarmGame={() => helpers.handleAddGameToFarmStaging(game.id)}
                    isSelected={stagingFarmGames.local.hasGame(game.id)}
                  />
                ))
              ) : (
                <span className="pt-6 px-4 text-slate-600">Nenhum jogo encontrado.</span>
              )}
            </div>
          </ScrollArea>
        </main>
        <div className="p-2 flex gap-2">
          <Button
            className="h-12 flex-1 rounded-sm z-30"
            variant="destructive"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            className="h-12 flex-1 rounded-sm relative z-40"
            onClick={helpers.handleActionButton}
            disabled={local.farmGames.isPending || local.stopFarm.isPending}
          >
            <span>{local.farmGames.isPending || local.stopFarm.isPending ? "Salvando" : "Salvar"}</span>
            {(local.farmGames.isPending || local.stopFarm.isPending) && (
              <div className="absolute top-1/2 -translate-y-1/2 right-4">
                <IconArrowClockwise className="w-4 h-4 animate-spin" />
              </div>
            )}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

DrawerChooseFarmingGamesView.displayName = "DrawerChooseFarmingGamesView"
