import { IconArrowClockwise } from "@/components/icons/IconArrowClockwise"
import { IconJoystick } from "@/components/icons/IconJoystick"
import { useFarmGames } from "@/components/molecules/FarmGames/context"
import { local_useSteamAccountListItem } from "@/components/molecules/FarmGames/controller"
import { GameItem } from "@/components/molecules/GameItem"
import { useSteamAccountStore } from "@/components/molecules/SteamAccountListItem/store/useSteamAccountStore"
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
import { useUser } from "@/contexts/UserContext"
import React from "react"

// export function ChooseFarmingGamesDesktop({ children }: React.PropsWithChildren) {
export function ChooseFarmingGamesDesktop() {
  const { helpers } = useFarmGames()
  const maxGamesAllowed = useUser(u => u.plan.maxGamesAllowed)
  const local = local_useSteamAccountListItem.farmGames()
  const modalOpen_desktop = useSteamAccountStore(state => state.modalOpen_desktop)
  const setModalOpen_desktop = useSteamAccountStore(state => state.setModalOpen_desktop)
  const stageFarmingGames_list = useSteamAccountStore(state => state.stageFarmingGames_list)

  return (
    <Sheet
      open={modalOpen_desktop}
      onOpenChange={setModalOpen_desktop}
    >
      <SheetTrigger asChild>
        <button className="flex h-full items-center px-6 group hover:bg-slate-700 transition-all duration-300">
          <div className="flex flex-col items-center">
            <span className="uppercase text-sm pb-1">
              {stageFarmingGames_list.length}/{maxGamesAllowed}
            </span>
            <div className="flex items-center gap-1 h-6 ">
              <IconJoystick className="transition-all duration-300 h-4 w-4 fill-slate-500 group-hover:fill-white" />
              <span className="transition-all duration-300 text-slate-500 group-hover:text-white">+</span>
            </div>
          </div>
        </button>
      </SheetTrigger>
      <SheetContent
        className="p-0 flex flex-col border-slate-800 h-screen"
        side="right"
      >
        <SheetHeader className="py-6 px-4">
          <SheetTitle>{local.accountName} - Seus jogos</SheetTitle>
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
            disabled={local.refreshGames.isPending}
            className="flex-1 relative"
          >
            <span>{local.refreshGames.isPending ? "Atualizando" : "Atualizar"}</span>
            {local.refreshGames.isPending && (
              <div className="absolute top-1/2 -translate-y-1/2 right-4">
                <IconArrowClockwise className="w-4 h-4 animate-spin" />
              </div>
            )}
          </Button>
        </div>
        <main className="flex-1 overflow-y-scroll pb-14">
          <div className="flex flex-col gap-2">
            {local.games ? (
              local.games.map(game => (
                <GameItemWrapper
                  key={game.id}
                  game={game}
                  handleFarmGame={() => helpers.handleAddGameToFarmStaging(game.id)}
                />
              ))
            ) : (
              <span className="pt-6 px-4 text-slate-600">Nenhum jogo encontrado.</span>
            )}
          </div>
        </main>
        <SheetFooter className="absolute left-0 right-0 bottom-0 z-30 gap-2">
          <div className="absolute left-0 right-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
          <Button
            className="flex-1 relative disabled:opacity-70 z-40"
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
          <CancelClick
            className="flex-1 z-30"
            variant="destructive"
          >
            Cancelar
          </CancelClick>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

ChooseFarmingGamesDesktop.displayName = "ChooseFarmingGamesDesktop"

export type GameItemWrapperProps = Omit<React.ComponentPropsWithoutRef<typeof GameItem>, "isSelected"> & {}

export type CancelClickProps = Omit<React.ComponentPropsWithoutRef<typeof Button>, "onClick"> & {}

export const CancelClick = React.forwardRef<React.ElementRef<typeof Button>, CancelClickProps>(
  function CancelClickComponent({ ...props }, ref) {
    const urgent = useSteamAccountStore(state => state.urgent)
    const setUrgent = useSteamAccountStore(state => state.setUrgent)
    const closeModal_desktop = useSteamAccountStore(state => state.closeModal_desktop)

    const handleCancelClick = () => {
      closeModal_desktop()
      if (urgent) setUrgent(false)
    }

    return (
      <Button
        {...props}
        onClick={handleCancelClick}
        ref={ref}
      />
    )
  }
)

CancelClick.displayName = "CancelClick"

export const GameItemWrapper = React.forwardRef<React.ElementRef<typeof GameItem>, GameItemWrapperProps>(
  function GameItemWrapperComponent({ ...props }, ref) {
    const localStagingFarm_hasGame = useSteamAccountStore(state => state.localStagingFarm_hasGame)

    return (
      <GameItem
        {...props}
        isSelected={localStagingFarm_hasGame(props.game.id)}
        ref={ref}
      />
    )
  }
)

GameItemWrapper.displayName = "GameItemWrapper"
