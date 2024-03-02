import { IconArrowClockwise } from "@/components/icons/IconArrowClockwise"
import { IconBroom } from "@/components/icons/IconBroom"
import { IconJoystick } from "@/components/icons/IconJoystick"
import { IconMagnifying } from "@/components/icons/IconMagnifying"
import { GameItem } from "@/components/molecules/GameItem"
import { useSteamAccountStore } from "@/components/molecules/SteamAccountListItem/store/useSteamAccountStore"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useFarmGames } from "./context"
import { local_useSteamAccountListItem } from "./controller"
import { ButtonSmall, ButtonSmallIcon } from "./desktop"

export function DrawerChooseFarmingGamesView() {
  const { helpers } = useFarmGames()
  const local = local_useSteamAccountListItem.farmGames()
  const modalOpen_desktop = useSteamAccountStore(state => state.modalOpen_desktop)
  const localStagingFarm_hasGame = useSteamAccountStore(state => state.localStagingFarm_hasGame)
  const closeModal_desktop = useSteamAccountStore(state => state.closeModal_desktop)

  return (
    <Drawer
      open={modalOpen_desktop}
      onOpenChange={helpers.onOpenChange}
    >
      <DrawerTrigger asChild>
        <button className="group relative flex h-full items-center px-6 py-2 transition-[background-color] duration-300 hover:bg-slate-700">
          <div className="flex flex-col items-end">
            <strong className="pb-0.5">Jogos</strong>
            <div className="flex h-6 items-center gap-2 ">
              <span className="text-sm uppercase">{helpers.gamesStaging}</span>
              <IconJoystick className="h-4 w-4 fill-slate-500 transition-[background-color] duration-300 group-hover:fill-white" />
              <span className="text-slate-500 transition-[background-color] duration-300 group-hover:text-white">
                +
              </span>
            </div>
          </div>
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="px-2">
          <DrawerTitle>{local.accountName} - Seus jogos</DrawerTitle>
          <DrawerDescription>Selecione os jogos que queira farmar e clique em salvar.</DrawerDescription>
          <label className="relative flex flex-col">
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <IconMagnifying className="h-4 w-4 text-slate-500" />
            </div>
            <Input
              placeholder="Filtre jogos"
              {...helpers.handleFilterInput}
            />
          </label>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <ButtonSmall
              className="pl-2 pr-4"
              onClick={() => helpers.clearLocalStagingFarmList()}
            >
              <ButtonSmallIcon>
                <IconBroom />
              </ButtonSmallIcon>
              <span>Resetar</span>
            </ButtonSmall>
            <div className="grid pl-1 tabular-nums">
              <span className="text-sm text-slate-500">{helpers.localStagingSelectedGames}</span>
            </div>
            <ButtonSmall
              className="ml-auto pl-2 pr-4"
              onClick={helpers.handleRefreshGames}
              disabled={local.refreshGames.isPending}
            >
              <ButtonSmallIcon>
                <IconArrowClockwise />
              </ButtonSmallIcon>
              <span>{local.refreshGames.isPending ? "Atualizando" : "Atualizar"}</span>
              {/* {local.refreshGames.isPending && (
              <div className="absolute top-1/2 -translate-y-1/2 right-4">
                <IconArrowClockwise className="w-4 h-4 animate-spin" />
              </div>
            )} */}
            </ButtonSmall>
          </div>
        </DrawerHeader>
        <main className="flex-1 overflow-y-scroll">
          <ScrollArea className="h-[45vh] rounded-sm px-2">
            <div className="flex flex-col gap-2">
              {helpers.gameList ? (
                helpers.gameList.map(game => (
                  <GameItem
                    height="7rem"
                    key={game.id}
                    game={game}
                    handleFarmGame={() => helpers.handleAddGameToFarmStaging(game.id)}
                    isSelected={localStagingFarm_hasGame(game.id)}
                  />
                ))
              ) : (
                <span className="px-4 pt-6 text-slate-600">Nenhum jogo encontrado.</span>
              )}
            </div>
          </ScrollArea>
        </main>
        <div className="flex gap-2 p-2">
          <Button
            className="z-30 h-12 flex-1 rounded-sm"
            variant="destructive"
            onClick={closeModal_desktop}
          >
            Cancelar
          </Button>
          <Button
            className="relative z-40 h-12 flex-1 rounded-sm"
            onClick={helpers.handleActionButton}
            disabled={helpers.actionSavingState}
          >
            <span>{helpers.actionSavingState ? "Salvando" : "Salvar"}</span>
            {helpers.actionSavingState && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <IconArrowClockwise className="h-4 w-4 animate-spin" />
              </div>
            )}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

DrawerChooseFarmingGamesView.displayName = "DrawerChooseFarmingGamesView"
