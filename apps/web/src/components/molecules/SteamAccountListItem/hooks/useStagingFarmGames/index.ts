import { AppError } from "@/util/AppError"
import React from "react"
import { HLocal, useLocal } from "./useLocal"

type Props = {
  farmingGames: number[]
  planMaxGamesAllowed: number
}

export function useStagingFarmGames({ farmingGames, planMaxGamesAllowed }: Props): HStagingFarmGames {
  const stageFarmingState = React.useState(farmingGames)
  const [localStagingGamesList, setLocalStagingGamesList] = React.useState<number[]>(farmingGames)
  const [urgent, setUrgent] = React.useState(false)
  const local = useLocal({ list: localStagingGamesList })
  const stageFarmingGames = stageFarmingState[0]

  const setStageFarmingGames = React.useCallback((newGameIdList: number[]) => {
    stageFarmingState[1](newGameIdList)
    setLocalStagingGamesList(newGameIdList)
  }, [])

  const handleAddGameToFarmStaging = React.useCallback(
    (gameId: number, onError: (message: AppError) => void) => {
      setLocalStagingGamesList(stageFarmingGames => {
        const isAdding = !stageFarmingGames.includes(gameId)
        if (!isAdding) return stageFarmingGames.filter(gid => gid !== gameId)
        if (stageFarmingGames.length >= planMaxGamesAllowed) {
          onError(
            new AppError(`Seu plano permite apenas o farm de ${planMaxGamesAllowed} jogos ao mesmo tempo.`)
          )
          return stageFarmingGames
        }
        return [...stageFarmingGames, gameId]
      })
    },
    [setLocalStagingGamesList, planMaxGamesAllowed]
  )

  const hasGamesOnTheList = React.useCallback(() => {
    return stageFarmingGames.length > 0
  }, [stageFarmingGames])

  const update = React.useCallback(
    (newGameIdList: number[], onError: (message: AppError) => void) => {
      if (newGameIdList.length > planMaxGamesAllowed) {
        const message = new AppError(
          `NSTH: O plano permite apenas o farm de ${planMaxGamesAllowed} jogos por vez.`
        )
        if (onError) onError(message)
        return message
      }
      setStageFarmingGames(newGameIdList)
      return null
    },
    [planMaxGamesAllowed]
  )

  const clear = React.useCallback(() => {
    setStageFarmingGames([])
  }, [])

  return {
    list: stageFarmingGames,
    urgentState: [urgent, setUrgent],
    handleAddGameToFarmStaging,
    hasGamesOnTheList,
    clear,
    update,
    setUrgent,
    local,
  }
}

export interface HStagingFarmGames {
  urgentState: [state: boolean, setState: React.Dispatch<React.SetStateAction<boolean>>]
  setUrgent(newValue: boolean): void
  // toggleFarmGame(gameId: number, onError: (error: AppError) => void): void
  list: number[]
  local: HLocal
  handleAddGameToFarmStaging(gameId: number, onError: (message: AppError) => void): void
  hasGamesOnTheList(): boolean
  clear(): void
  update(newGameIdList: number[], onError?: (message: AppError) => void): AppError | null
}
