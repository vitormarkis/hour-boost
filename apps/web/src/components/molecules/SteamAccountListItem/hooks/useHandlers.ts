import { IntentionCodes as IntentionCodes_FarmGames } from "@/components/molecules/FarmGames/types"
import { HStagingFarmGames } from "@/components/molecules/SteamAccountListItem/hooks/useStagingFarmGames"
import { IntentionCodes as IntentionCodes_StopFarm } from "@/components/molecules/StopFarm/types"
import { IUserContext } from "@/contexts/UserContext"
import { FarmGamesMutationResult, StopFarmMutationResult } from "@/mutations"
import { QUERY_KEYS } from "@/mutations/queryKeys"
import { DataOrMessage } from "@/util/DataOrMessage"
import { QueryClient } from "@tanstack/react-query"
import React from "react"

type Props = {
  stopFarm: StopFarmMutationResult
  queryClient: QueryClient
  userId: string
  farmGames: FarmGamesMutationResult
  user: Pick<IUserContext, "updateFarmingGames" | "startFarm">
  stagingFarmGames: Pick<HStagingFarmGames, "clear" | "setUrgent">
}

export function useHandlers({ stopFarm, queryClient, stagingFarmGames, userId, farmGames, user }: Props) {
  const handleStopFarm = React.useCallback(
    async (
      accountName: string
    ): Promise<{
      dataOrMessage: DataOrMessage<string, IntentionCodes_StopFarm>
    }> => {
      const dataOrMessage = await stopFarm.mutateAsync({ accountName })
      const [undesired, success] = dataOrMessage
      if (undesired) {
        return Promise.resolve({
          dataOrMessage: [undesired],
        })
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user_session(userId) })
      // stagingFarmGames.clear()
      return Promise.resolve({
        dataOrMessage: [null, success],
      })
    },
    [stopFarm, queryClient, stagingFarmGames.clear]
  )

  const handleFarmGames = React.useCallback(
    async (
      accountName: string,
      gamesID: number[],
      userId: string
    ): Promise<{
      dataOrMessage: DataOrMessage<string, IntentionCodes_FarmGames>
    }> => {
      const dataOrMessage = await farmGames.mutateAsync({
        accountName,
        gamesID,
        userId,
      })
      const now = new Date()
      user.updateFarmingGames({
        accountName,
        gameIdList: gamesID,
      })
      user.startFarm({
        accountName,
        when: now,
      })
      stagingFarmGames.setUrgent(false)
      // 22: startFarm() only if farming games was 0 and staging list had more than 1 game
      return {
        dataOrMessage,
      }
    },
    [farmGames, user.updateFarmingGames, user.startFarm]
  )

  return {
    handleFarmGames,
    handleStopFarm,
  }
}

export interface HHandlers {
  handleStopFarm(accountName: string): Promise<{
    dataOrMessage: DataOrMessage<string, IntentionCodes_StopFarm>
  }>
  handleFarmGames(
    accountName: string,
    gamesID: number[],
    userId: string
  ): Promise<{
    dataOrMessage: DataOrMessage<string, IntentionCodes_FarmGames>
  }>
}
