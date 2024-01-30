import { IconArrowClockwise } from "@/components/icons/IconArrowClockwise"
import { IconBroom } from "@/components/icons/IconBroom"
import { IconJoystick } from "@/components/icons/IconJoystick"
import { useFarmGames } from "@/components/molecules/FarmGames/context"
import { local_useSteamAccountListItem } from "@/components/molecules/FarmGames/controller"
import { GameItem } from "@/components/molecules/GameItem"
import { useSteamAccountStore } from "@/components/molecules/SteamAccountListItem/store/useSteamAccountStore"
import { Input } from "@/components/ui/input"
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
import { Slot } from "@radix-ui/react-slot"
import React, { PropsWithChildren } from "react"
import { IconMagnifying } from "@/components/icons/IconMagnifying"

// export function ChooseFarmingGamesDesktop({ children }: React.PropsWithChildren) {
export function ChooseFarmingGamesDesktop() {
  const { helpers } = useFarmGames()
  const maxGamesAllowed = useUser(u => u.plan.maxGamesAllowed)
  const local = local_useSteamAccountListItem.farmGames()
  const modalOpen_desktop = useSteamAccountStore(state => state.modalOpen_desktop)
  const setModalOpen_desktop = useSteamAccountStore(state => state.setModalOpen_desktop)
  const stageFarmingGames_list = useSteamAccountStore(state => state.stageFarmingGames_list)
  const filterInputLocalStaging = useSteamAccountStore(state => state.filterInputLocalStaging)
  const filterInputLocalStaging_set = useSteamAccountStore(state => state.filterInputLocalStaging_set)

  const setUrgent = useSteamAccountStore(state => state.setUrgent)

  return (
    <Sheet
      open={modalOpen_desktop}
      onOpenChange={isOpen => {
        if (!isOpen) setUrgent(false)
        setModalOpen_desktop(isOpen)
      }}
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
        className="p-0 border-none bg-transparent"
        side="right"
      >
        <div className="p-0 flex flex-col h-screen">
          <div className="absolute inset-0 bottom-[4.5rem] rounded-b-md border-l border-b border-slate-800 bg-background overflow-hidden">
            <SheetHeader className="pt-6 px-4">
              <SheetTitle>{local.accountName} - Seus jogos</SheetTitle>
              <SheetDescription>Selecione os jogos que queira farmar e clique em salvar.</SheetDescription>
              <label className="flex flex-col relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <IconMagnifying className="w-4 h-4 text-slate-500" />
                </div>
                <Input
                  placeholder="Filtre jogos"
                  value={filterInputLocalStaging}
                  onChange={e => filterInputLocalStaging_set(e.target.value)}
                />
              </label>
            </SheetHeader>
            <div className="flex flex-wrap gap-2 px-4 pt-4">
              <ButtonSmall
                className="pr-4 pl-2"
                onClick={() => helpers.clearLocalStagingFarmList()}
              >
                <ButtonSmallIcon>
                  <IconBroom />
                </ButtonSmallIcon>
                <span>Resetar</span>
              </ButtonSmall>
              <ButtonSmall
                className="pr-4 pl-2"
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
            <main className="flex-1 overflow-y-scroll pb-14 mt-4 h-[calc(100%_-_8rem)]">
              <div className="flex flex-col gap-2 overflow-y-hidden">
                {helpers.gameList ? (
                  helpers.gameList.map(game => (
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
          </div>
        </div>
        <SheetFooter className="absolute left-0 right-0 bottom-0 z-30 gap-4 pb-4 pr-4">
          <ButtonSmall
            className="flex-1 relative disabled:opacity-70 z-40"
            onClick={helpers.handleActionButton}
            disabled={helpers.actionSavingState}
            size="big"
          >
            <span>{helpers.actionSavingState ? "Salvando" : "Salvar"}</span>
            {helpers.actionSavingState && (
              <div className="absolute top-1/2 -translate-y-1/2 right-4">
                <IconArrowClockwise className="w-4 h-4 animate-spin" />
              </div>
            )}
          </ButtonSmall>
          <CancelClick
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            size="big"
          >
            Cancelar
          </CancelClick>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

ChooseFarmingGamesDesktop.displayName = "ChooseFarmingGamesDesktop"

export type ButtonSmallProps = React.ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof buttonSmallVariants> & {}

import { tv, VariantProps } from "tailwind-variants"
export const buttonSmallVariants = tv(
  {
    base: "flex items-center justify-center px-4 gap-2 rounded-md bg-white text-black font-medium disabled:bg-neutral-300 disabled:cursor-not-allowed hover:bg-neutral-200",
    variants: {
      size: {
        regular: "h-6 text-xs",
        big: "h-10 font-medium",
      },
    },
    defaultVariants: {
      size: "regular",
    },
  },
  {
    responsiveVariants: true,
  }
)

export const ButtonSmall = React.forwardRef<React.ElementRef<"button">, ButtonSmallProps>(
  function ButtonSmallComponent({ size, className, ...props }, ref) {
    return (
      <button
        {...props}
        className={buttonSmallVariants({ size, className })}
        ref={ref}
      />
    )
  }
)

export const ButtonSmallIcon: React.FC<PropsWithChildren> = ({ children }) => (
  <Slot className="w-3 h-3 fill-white">{children}</Slot>
)

ButtonSmall.displayName = "ButtonSmall"

export type GameItemWrapperProps = Omit<React.ComponentPropsWithoutRef<typeof GameItem>, "isSelected"> & {}

export type CancelClickProps = Omit<React.ComponentPropsWithoutRef<typeof ButtonSmall>, "onClick"> & {}

export const CancelClick = React.forwardRef<React.ElementRef<typeof ButtonSmall>, CancelClickProps>(
  function CancelClickComponent({ ...props }, ref) {
    const urgent = useSteamAccountStore(state => state.urgent)
    const setUrgent = useSteamAccountStore(state => state.setUrgent)
    const closeModal_desktop = useSteamAccountStore(state => state.closeModal_desktop)

    const handleCancelClick = () => {
      closeModal_desktop()
      if (urgent) setUrgent(false)
    }

    return (
      <ButtonSmall
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
