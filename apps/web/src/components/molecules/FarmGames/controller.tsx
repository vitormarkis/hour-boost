import { useMediaQuery } from "@/components/hooks"
import { useSteamAccountListItem } from "@/components/molecules/SteamAccountListItem/context"
import { useUser } from "@/contexts/UserContext"
import { showToastFarmGamesResult, showToastFarmingGame } from "@/util/toaster"
import { GameSession } from "core"
import React from "react"
import { toast } from "sonner"
import { SheetChooseFarmingGamesView } from "./desktop"
import { DrawerChooseFarmingGamesView } from "./mobile"
import { ChooseFarmingGamesHelpers } from "./types"

export interface FarmGamesPayload {
  accountName: string
  gamesID: number[]
  userId: string
}
export type DrawerSheetChooseFarmingGamesProps = {
  open?: boolean
  onOpenChange?(isOpening: boolean): boolean
  children: React.ReactNode
}

export const DrawerSheetChooseFarmingGames = React.forwardRef<
  React.ElementRef<typeof SheetChooseFarmingGamesView>,
  DrawerSheetChooseFarmingGamesProps
>(function DrawerSheetChooseFarmingGamesComponent({ children }, ref) {
  const {
    modalSelectGames,
    stagingFarmGames,
    accountName,
    games,
    farmGames,
    stopFarm,
    refreshGames,
    handlers,
  } = local_useSteamAccountListItem.controller()
  const isLessDesktop = useMediaQuery("(max-width: 896px)")
  const user = useUser()

  const initialStageFarmingGames = user.steamAccounts.find(sa => sa.accountName === accountName)
    ?.farmingGames!

  const stopFarmGamesHandler = React.useCallback(async () => {
    await stopFarm.mutateAsync({ accountName })
  }, [stopFarm])

  const farmGamesHandler = React.useCallback(
    async (games: GameSession[]) => {
      const { dataOrMessage } = await handlers.handleFarmGames(accountName, stagingFarmGames.list, user.id)
      const [undesired] = dataOrMessage
      if (undesired) return showToastFarmGamesResult(undesired)
      showToastFarmingGame(stagingFarmGames.list, games)
      modalSelectGames.closeModal()
    },
    [farmGames, modalSelectGames, stagingFarmGames.list, user]
  )

  function handleStopFarm() {
    stagingFarmGames.clear()
  }

  function handleFarmGame(gameId: number) {
    stagingFarmGames.toggleFarmGame(gameId, error => {
      toast.info(error.message)
    })
  }

  async function handleRefreshGames() {
    const { games } = await refreshGames.mutateAsync({ accountName: accountName })
    user.setGames(accountName, games)
  }

  const helpers: ChooseFarmingGamesHelpers = {
    handleFarmGame,
    handleRefreshGames,
    handleStopFarm,
  }

  if (isLessDesktop) {
    return (
      <DrawerChooseFarmingGamesView
        state={modalSelectGames.state}
        ref={ref}
        helpers={helpers}
      >
        {children}
      </DrawerChooseFarmingGamesView>
    )
  }

  return (
    <SheetChooseFarmingGamesView
      state={modalSelectGames.state}
      ref={ref}
      helpers={helpers}
    >
      {children}
    </SheetChooseFarmingGamesView>
  )
})

DrawerSheetChooseFarmingGames.displayName = "DrawerSheetChooseFarmingGames"

export const local_useSteamAccountListItem = {
  controller() {
    return useSteamAccountListItem(state => ({
      refreshGames: state.mutations.refreshGames,
      modalSelectGames: {
        closeModal: state.modalSelectGames.closeModal,
        state: state.modalSelectGames.state,
      },
      stagingFarmGames: state.stagingFarmGames,
      accountName: state.app.accountName,
      games: state.app.games,
      farmGames: state.mutations.farmGames,
      stopFarm: state.mutations.stopFarm,
      handlers: state.handlers,
    }))
  },
  farmGames() {
    return useSteamAccountListItem(state => ({
      accountName: state.app.accountName,
      games: state.app.games,
      stageFarmingGames: state.stagingFarmGames.list,
      farmGames: state.mutations.farmGames,
      stopFarm: state.mutations.stopFarm,
      refreshGames: state.mutations.refreshGames,
    }))
  },
}
