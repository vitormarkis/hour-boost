import { useMediaQuery } from "@/components/hooks"
import { FarmGamesContext } from "@/components/molecules/FarmGames/context"
import { useSteamAccountListItem } from "@/components/molecules/SteamAccountListItem/context"
import { useSteamAccountStore } from "@/components/molecules/SteamAccountListItem/store/useSteamAccountStore"
import { useUser } from "@/contexts/UserContext"
import { DataOrMessage } from "@/util/DataOrMessage"
import { showToastFarmGamesResult, showToastFarmingGame } from "@/util/toaster"
import { GameSession } from "core"
import React from "react"
import { toast } from "sonner"
import { ChooseFarmingGamesDesktop } from "./desktop"
import { DrawerChooseFarmingGamesView } from "./mobile"
import { ChooseFarmingGamesHelpers, IntentionCodes } from "./types"

export interface FarmGamesPayload {
  accountName: string
  gamesID: number[]
  userId: string
}
export type ChooseFarmingGamesDesktopProps = {
  open?: boolean
  onOpenChange?(isOpening: boolean): boolean
}

export const ChooseFarmingGames = React.memo(
  React.forwardRef<React.ElementRef<typeof ChooseFarmingGamesDesktop>, ChooseFarmingGamesDesktopProps>(
    function ChooseFarmingGamesDesktopComponent(_, ref) {
      const { isFarming, accountName, refreshGames, handlers, app } =
        local_useSteamAccountListItem.controller()
      const isLessDesktop = useMediaQuery("(max-width: 896px)")
      const stageFarmingGames_update = useSteamAccountStore(state => state.stageFarmingGames_update)
      const localStagingFarm_list = useSteamAccountStore(state => state.localStagingFarm_list)
      const closeModal_desktop = useSteamAccountStore(state => state.closeModal_desktop)
      const stageFarmingGames_hasGamesOnTheList = useSteamAccountStore(
        state => state.stageFarmingGames_hasGamesOnTheList
      )
      const urgent = useSteamAccountStore(state => state.urgent)
      const stageFarmingGames_handleAddGameToFarmStaging = useSteamAccountStore(
        state => state.handleAddGameToFarmStaging
      )
      const user = useUser()

      const handleUpdateStagingGames = () => {}

      const handleActionButton = React.useCallback(async () => {
        stageFarmingGames_update()

        const getFarmGamesPromise = () => {
          return handlers.handleFarmGames(accountName, localStagingFarm_list, user.id)
        }
        const args = [app.games, localStagingFarm_list, () => closeModal_desktop()] as const

        if (urgent) {
          if (!stageFarmingGames_hasGamesOnTheList()) {
            toast.warning("Adicione pelo menos 1 jogo para começar o farm.")
            return
          }
          const [error] = await startFarmAbstraction(getFarmGamesPromise(), ...args)
          if (error) return
          return
        }
        if (!isFarming() || !stageFarmingGames_hasGamesOnTheList()) {
          toast.success("Jogos salvos.")
          closeModal_desktop()
          return
        }
        const [error] = await startFarmAbstraction(getFarmGamesPromise(), ...args)
        if (error) return
        return
      }, [
        handlers.handleFarmGames,
        app.games,
        localStagingFarm_list,
        closeModal_desktop,
        urgent,
        stageFarmingGames_hasGamesOnTheList(),
        isFarming(),
      ])

      function handleStopFarm() {
        // stagingFarmGames.clear()
      }

      async function handleRefreshGames() {
        const { games } = await refreshGames.mutateAsync({ accountName: accountName })
        user.setGames(accountName, games)
      }

      const handleAddGameToFarmStaging = React.useCallback(
        (gameId: number) => {
          stageFarmingGames_handleAddGameToFarmStaging(gameId, error => {
            toast.info(error.message)
          })
        },
        [stageFarmingGames_handleAddGameToFarmStaging]
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
            helpers: helpers,
          }}
        >
          {isLessDesktop && <DrawerChooseFarmingGamesView />}
          {!isLessDesktop && <ChooseFarmingGamesDesktop />}
        </FarmGamesContext.Provider>
      )
    }
  )
)

ChooseFarmingGames.displayName = "ChooseFarmingGamesDesktop"

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
      farmGames: state.mutations.farmGames,
      stopFarm: state.mutations.stopFarm,
      refreshGames: state.mutations.refreshGames,
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
