import { useMediaQuery } from "@/components/hooks"
import { IntentionCodes } from "@/components/molecules/FarmGames/types"
import { useUser } from "@/contexts/UserContext"
import { api } from "@/lib/axios"
import { useFarmGamesMutation, useRefreshGamesMutation, useStopFarmMutation } from "@/mutations"
import { AppError } from "@/util/AppError"
import { DataOrMessage } from "@/util/DataOrMessage"
import { useAuth } from "@clerk/clerk-react"
import React, { useMemo, useState } from "react"
import { ISteamAccountListItemContext, SteamAccountListItemContext } from "./context"
import { SteamAccountListItemViewDesktop } from "./desktop"
import { SteamAccountListItemViewMobile } from "./mobile"
import { SteamAccountAppProps, SteamAccountStatusProps } from "./types"

export function SteamAccountList({
  app,
  status,
}: {
  status: SteamAccountStatusProps
  app: SteamAccountAppProps
}) {
  const isLessDesktop = useMediaQuery("(max-width: 896px)")
  const [modalSelectGamesOpen, setModalSelectGamesOpen] = useState(false)
  const [stageFarmingGames, setStageFarmingGames] = useState(app.farmingGames)
  const [urgent, setUrgent] = useState(false)
  const user = useUser(user => ({
    maxGamesAllowed: user.plan.maxGamesAllowed,
    setGames: user.setGames,
    updateFarmingGames: user.updateFarmingGames,
    startFarm: user.startFarm,
  }))

  const { getToken } = useAuth()
  const getAPI = async () => {
    api.defaults.headers["Authorization"] = `Bearer ${await getToken()}`
    return api
  }

  const refreshGames = useRefreshGamesMutation(getAPI)
  const stopFarm = useStopFarmMutation(getAPI)
  const farmGames = useFarmGamesMutation(getAPI)

  async function handleFarmGames(
    accountName: string,
    gamesID: number[],
    userId: string
  ): Promise<{
    dataOrMessage: DataOrMessage<string, IntentionCodes>
  }> {
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
    setUrgent(false)
    // 22: startFarm() only if farming games was 0 and staging list had more than 1 game
    return {
      dataOrMessage,
    }
  }

  const hasGamesOnTheList = React.useCallback(
    function hasGamesOnTheList() {
      return stageFarmingGames.length > 0
    },
    [stageFarmingGames]
  )

  const clear = React.useCallback(() => {
    setStageFarmingGames([])
  }, [])

  const toggleFarmGame = React.useCallback(
    function toggleFarmGame(gameId: number, onError: (error: AppError) => void) {
      setStageFarmingGames(stageFarmingGames => {
        const isAdding = !stageFarmingGames.includes(gameId)
        if (!isAdding) return stageFarmingGames.filter(gid => gid !== gameId)
        if (stageFarmingGames.length >= user.maxGamesAllowed) {
          onError(
            new AppError(`Seu plano permite apenas o farm de ${user.maxGamesAllowed} jogos ao mesmo tempo.`)
          )
          return stageFarmingGames
        }
        return [...stageFarmingGames, gameId]
      })
    },
    [user.maxGamesAllowed, setStageFarmingGames, stageFarmingGames]
  )

  function closeModal() {
    setModalSelectGamesOpen(false)
  }

  function openModal() {
    setModalSelectGamesOpen(true)
  }

  const props: ISteamAccountListItemContext = useMemo(
    () => ({
      ...status,
      mutations: {
        farmGames,
        refreshGames,
        stopFarm,
      },
      handlers: {
        handleFarmGames,
      },
      stagingFarmGames: {
        list: stageFarmingGames,
        urgentState: [urgent, setUrgent],
        toggleFarmGame,
        hasGamesOnTheList,
        clear,
      },
      app,
      status: "offline",
      hoursFarmedInSeconds: 0,
      farmingTime: 0,
      modalSelectGames: {
        closeModal,
        openModal,
        state: [modalSelectGamesOpen, setModalSelectGamesOpen],
      },
    }),
    [
      stageFarmingGames,
      handleFarmGames,
      clear,
      modalSelectGamesOpen,
      app,
      status,
      toggleFarmGame,
      hasGamesOnTheList,
      farmGames,
      refreshGames,
      stopFarm,
    ]
  )

  return (
    <SteamAccountListItemContext.Provider value={props}>
      {isLessDesktop && <SteamAccountListItemViewMobile />}
      {!isLessDesktop && <SteamAccountListItemViewDesktop />}
    </SteamAccountListItemContext.Provider>
  )
}
