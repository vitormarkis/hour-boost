import { IconArrowClockwise } from "@/components/icons/IconArrowClockwise"
import { IconBroom } from "@/components/icons/IconBroom"
import { IconJoystick } from "@/components/icons/IconJoystick"
import { IconMagnifying } from "@/components/icons/IconMagnifying"
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
import { Slot } from "@radix-ui/react-slot"
import React, { PropsWithChildren } from "react"

// export function ChooseFarmingGamesDesktop({ children }: React.PropsWithChildren) {
export function ChooseFarmingGamesDesktop() {
  const { helpers } = useFarmGames()
  const local = local_useSteamAccountListItem.farmGames()
  const modalOpen_desktop = useSteamAccountStore(state => state.modalOpen_desktop)

  return (
    <Sheet
      open={modalOpen_desktop}
      onOpenChange={helpers.onOpenChange}
    >
      <SheetTrigger asChild>
        <button className="group flex h-full items-center px-6 transition-all duration-300 hover:bg-slate-700">
          <div className="flex flex-col items-center">
            <span className="pb-1 text-sm uppercase">{helpers.gamesStaging}</span>
            <div className="flex h-6 items-center gap-1 ">
              <IconJoystick className="h-4 w-4 fill-slate-500 transition-all duration-300 group-hover:fill-white" />
              <span className="text-slate-500 transition-all duration-300 group-hover:text-white">+</span>
            </div>
          </div>
        </button>
      </SheetTrigger>
      <SheetContent
        className="border-none bg-transparent p-0"
        side="right"
      >
        <div className="flex h-screen flex-col p-0">
          <div className="bg-background absolute inset-0 bottom-[4.5rem] overflow-hidden rounded-b-md border-b border-l border-slate-800">
            <SheetHeader className="px-4 pt-6">
              <SheetTitle>{local.accountName} - Seus jogos</SheetTitle>
              <SheetDescription>Selecione os jogos que queira farmar e clique em salvar.</SheetDescription>
              <label className="relative flex flex-col">
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <IconMagnifying className="h-4 w-4 text-slate-500" />
                </div>
                <Input
                  placeholder="Filtre jogos"
                  {...helpers.handleFilterInput}
                />
              </label>
            </SheetHeader>
            <div className="flex flex-wrap gap-2 px-4 pt-4">
              <ButtonSmall
                className="pl-2 pr-4"
                onClick={() => helpers.clearLocalStagingFarmList()}
              >
                <ButtonSmallIcon>
                  <IconBroom />
                </ButtonSmallIcon>
                <span>Resetar</span>
              </ButtonSmall>
              <ButtonSmall
                className="pl-2 pr-4"
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
              <div className="grid pl-1 tabular-nums">
                <span className="text-sm text-slate-500">{helpers.localStagingSelectedGames}</span>
              </div>
            </div>
            <main className="mt-4 h-[calc(100%_-_8rem)] flex-1 overflow-y-scroll pb-14">
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
                  <span className="px-4 pt-6 text-slate-600">Nenhum jogo encontrado.</span>
                )}
              </div>
            </main>
          </div>
        </div>
        <SheetFooter className="absolute bottom-0 left-0 right-0 z-30 gap-4 pb-4 pr-4">
          <ButtonSmall
            className="relative z-40 flex-1 disabled:opacity-70"
            onClick={helpers.handleActionButton}
            disabled={helpers.actionSavingState}
            size="big"
          >
            <span>{helpers.actionSavingState ? "Salvando" : "Salvar"}</span>
            {helpers.actionSavingState && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <IconArrowClockwise className="h-4 w-4 animate-spin" />
              </div>
            )}
          </ButtonSmall>
          <CancelClick
            className="flex-1 bg-red-500 text-white hover:bg-red-600"
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
  <Slot className="h-3 w-3 fill-white">{children}</Slot>
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
