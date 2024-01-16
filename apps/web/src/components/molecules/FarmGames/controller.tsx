import { useMediaQuery } from "@/components/hooks"
import { FarmGamesContext } from "@/components/molecules/FarmGames/context"
import { useSteamAccountListItem } from "@/components/molecules/SteamAccountListItem/context"
import { useUser } from "@/contexts/UserContext"
import { DataOrMessage } from "@/util/DataOrMessage"
import { showToastFarmGamesResult, showToastFarmingGame } from "@/util/toaster"
import { GameSession } from "core"
import React from "react"
import { toast } from "sonner"
import { SheetChooseFarmingGamesView } from "./desktop"
import { DrawerChooseFarmingGamesView } from "./mobile"
import { ChooseFarmingGamesHelpers, IntentionCodes } from "./types"

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
    isFarming,
    accountName,
    farmGames,
    refreshGames,
    handlers,
    app,
  } = local_useSteamAccountListItem.controller()
  const { local } = stagingFarmGames
  const isLessDesktop = useMediaQuery("(max-width: 896px)")
  const user = useUser()
  const [urgent] = stagingFarmGames.urgentState

  const handleUpdateStagingGames = () => {}

  const handleActionButton = React.useCallback(async () => {
    const errorUpdatingStaging = stagingFarmGames.update(local.list)
    if (errorUpdatingStaging) {
      toast.error(errorUpdatingStaging.message)
      return
    }

    const getFarmGamesPromise = () => {
      return handlers.handleFarmGames(accountName, local.list, user.id)
    }
    const args = [app.games, local.list, () => modalSelectGames.closeModal()] as const

    if (urgent) {
      if (!local.hasGamesInList()) {
        toast.warning("Adicione pelo menos 1 jogo para começar o farm.")
        return
      }
      const [error] = await startFarmAbstraction(getFarmGamesPromise(), ...args)
      if (error) return
      return
    }
    if (!isFarming() || !local.hasGamesInList()) {
      toast.success("Jogos salvos.")
      modalSelectGames.closeModal()
      return
    }
    const [error] = await startFarmAbstraction(getFarmGamesPromise(), ...args)
    if (error) return
    return
  }, [
    handlers.handleFarmGames,
    app.games,
    local.list,
    modalSelectGames.closeModal,
    urgent,
    stagingFarmGames.hasGamesOnTheList(),
    isFarming(),
  ])

  function handleStopFarm() {
    stagingFarmGames.clear()
  }

  async function handleRefreshGames() {
    const { games } = await refreshGames.mutateAsync({ accountName: accountName })
    user.setGames(accountName, games)
  }

  const handleAddGameToFarmStaging = React.useCallback(
    (gameId: number) => {
      stagingFarmGames.handleAddGameToFarmStaging(gameId, error => {
        toast.info(error.message)
      })
    },
    [stagingFarmGames.handleAddGameToFarmStaging]
  )

  const helpers: ChooseFarmingGamesHelpers = {
    handleRefreshGames,
    handleStopFarm,
    handleUpdateStagingGames,
    handleActionButton,
    handleAddGameToFarmStaging,
  }

  return (
    <FarmGamesContext.Provider
      value={{
        state: modalSelectGames.state,
        helpers: helpers,
      }}
    >
      {isLessDesktop && <DrawerChooseFarmingGamesView>{children}</DrawerChooseFarmingGamesView>}
      {!isLessDesktop && <SheetChooseFarmingGamesView>{children}</SheetChooseFarmingGamesView>}
    </FarmGamesContext.Provider>
  )
})

DrawerSheetChooseFarmingGames.displayName = "DrawerSheetChooseFarmingGames"

export const local_useSteamAccountListItem = {
  controller() {
    return useSteamAccountListItem(state => ({
      refreshGames: state.mutations.refreshGames,
      accountName: state.app.accountName,
      games: state.app.games,
      farmGames: state.mutations.farmGames,
      stopFarm: state.mutations.stopFarm,
      ...state,
    }))
  },
  farmGames() {
    return useSteamAccountListItem(state => ({
      accountName: state.app.accountName,
      games: state.app.games,
      stageFarmingGames: {
        list: state.stagingFarmGames.list,
        urgentState: state.stagingFarmGames.urgentState,
        hasGamesOnTheList: state.stagingFarmGames.hasGamesOnTheList,
      },
      farmGames: state.mutations.farmGames,
      stopFarm: state.mutations.stopFarm,
      refreshGames: state.mutations.refreshGames,
      modalSelectGames: state.modalSelectGames,
      isFarming: () => state.isFarming(),
      handleFarmGames: state.handlers.handleFarmGames,
    }))
  },
}

async function startFarmAbstraction(
  promise: Promise<{
    dataOrMessage: DataOrMessage<string, IntentionCodes>
  }>,
  games: GameSession[] | null,
  stageFarmingGamesList: number[],
  closeModal: () => void
): Promise<[error: boolean]> {
  if (!games) {
    toast.error("Nenhum jogo foi encontrado na sua conta, atualize seus jogos ou a página.")
    return [true]
  }
  const { dataOrMessage } = await promise
  const [undesired] = dataOrMessage
  if (undesired) {
    showToastFarmGamesResult(undesired)
    return [true]
  }
  showToastFarmingGame(stageFarmingGamesList, games)
  closeModal()
  return [false]
}
