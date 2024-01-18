import { useMediaQuery } from "@/components/hooks"
import { IntentionCodes } from "@/components/molecules/FarmGames/types"
import { useUser } from "@/contexts/UserContext"
import { api } from "@/lib/axios"
import { useFarmGamesMutation, useRefreshGamesMutation, useStopFarmMutation } from "@/mutations"
import { DataOrMessage, Message } from "@/util/DataOrMessage"
import { thisPlanIsUsage } from "@/util/thisPlanIsUsage"
import { useAuth } from "@clerk/clerk-react"
import { useQueryClient } from "@tanstack/react-query"
import { AppAccountStatus, GameSession, formatTimeSince } from "core"
import React, { useMemo, useState } from "react"
import { ISteamAccountListItemContext, SteamAccountListItemContext } from "./context"
import { SteamAccountListItemViewDesktop } from "./desktop"
import { useHandlers } from "./hooks/useHandlers"
import { useStagingFarmGames } from "./hooks/useStagingFarmGames"
import { SteamAccountListItemViewMobile } from "./mobile"
import { SteamAccountAppProps, SteamAccountListItemViewProps, SteamAccountStatusProps } from "./types"

export function SteamAccountList({
  app,
  status: statusProps,
}: {
  status: SteamAccountStatusProps
  app: SteamAccountAppProps
}) {
  const [status, setStatusState] = useState<AppAccountStatus>(app.status)
  const { getToken } = useAuth()
  const getAPI = async () => {
    api.defaults.headers["Authorization"] = `Bearer ${await getToken()}`
    return api
  }

  const setStatus = React.useCallback(async (newStatus: AppAccountStatus) => {
    await new Promise(res => setTimeout(res, 1000))
    setStatusState(newStatus)
  }, [])

  const queryClient = useQueryClient()

  const refreshGames = useRefreshGamesMutation(getAPI)
  const stopFarm = useStopFarmMutation(getAPI)
  const farmGames = useFarmGamesMutation(getAPI)

  const isLessDesktop = useMediaQuery("(max-width: 896px)")
  const [modalSelectGamesOpen, setModalSelectGamesOpen] = useState(false)
  const user = useUser()
  const stagingFarmGames = useStagingFarmGames({
    farmingGames: app.farmingGames,
    planMaxGamesAllowed: user.plan.maxGamesAllowed,
  })

  const handlers = useHandlers({
    farmGames,
    queryClient,
    stagingFarmGames,
    stopFarm,
    user,
    userId: user.id,
  })

  function closeModal() {
    setModalSelectGamesOpen(false)
  }

  function openModal() {
    setModalSelectGamesOpen(true)
  }

  const isFarming = React.useCallback(() => {
    return app.farmingGames.length > 0
  }, [app.farmingGames.length])

  const hasUsagePlanLeft = React.useCallback(() => {
    if (!thisPlanIsUsage(user.plan)) return true
    return app.farmedTimeInSeconds < user.plan.maxUsageTime
  }, [app.farmedTimeInSeconds])

  const handleClickFarmButton = React.useCallback(async (): Promise<
    DataOrMessage<{ list: number[]; games: GameSession[] } | Message, IntentionCodes>
  > => {
    if (isFarming()) {
      const { dataOrMessage } = await handlers.handleStopFarm(app.accountName)
      const [undesired] = dataOrMessage
      if (undesired) return [undesired]
      // if (undesired) return toast[undesired.type](undesired.message)
      return [null, new Message("Farm pausado.", "info")]
    }
    if (!stagingFarmGames.hasGamesOnTheList()) {
      const [_, setUrgentState] = stagingFarmGames.urgentState
      setUrgentState(true)
      openModal()

      return [new Message("Você precisa escolher alguns jogos primeiro.", "info")]
      // toast.info("Você precisa escolher alguns jogos primeiro.")
      // farm on save true
    }
    if (!app.games) {
      return [
        new Message("Nenhum jogo foi encontrado na sua conta, atualize seus jogos ou a página.", "error"),
      ]
      // toast.error("Nenhum jogo foi encontrado na sua conta, atualize seus jogos ou a página.")
    }
    const { dataOrMessage } = await handlers.handleFarmGames(app.accountName, stagingFarmGames.list, user.id)
    const [undesired] = dataOrMessage
    if (undesired) return [undesired]
    return [null, { list: stagingFarmGames.list, games: app.games }]
    // onError(staging)
    // if (undesired) return showToastFarmGamesResult(undesired)
    // showToastFarmingGame(stagingFarmGames.list, games)
  }, [
    handlers.handleStopFarm,
    app.accountName,
    stagingFarmGames.hasGamesOnTheList,
    stagingFarmGames.urgentState,
    openModal,
    app.games,
    handlers.handleFarmGames,
    stagingFarmGames.list,
  ])

  const value: ISteamAccountListItemContext = useMemo(
    () => ({
      setStatus,
      ...statusProps,
      mutations: {
        farmGames,
        refreshGames,
        stopFarm,
      },
      isFarming,
      hasUsagePlanLeft,
      handlers,
      stagingFarmGames,
      app,
      status,
      farmingTime: 0,
      modalSelectGames: {
        closeModal,
        openModal,
        state: [modalSelectGamesOpen, setModalSelectGamesOpen],
      },
    }),
    [
      statusProps,
      farmGames,
      refreshGames,
      stopFarm,
      app.farmingGames.length,
      handlers,
      stagingFarmGames,
      app,
      closeModal,
      openModal,
      modalSelectGamesOpen,
      setModalSelectGamesOpen,
    ]
  )

  const actionText = getActionText({
    farmGamesPending: farmGames.isPending,
    stopFarmPending: stopFarm.isPending,
    isFarming: isFarming(),
  })

  const props: SteamAccountListItemViewProps = {
    handleClickFarmButton,
    actionText,
  }

  return (
    <SteamAccountListItemContext.Provider value={value}>
      {isLessDesktop && <SteamAccountListItemViewMobile {...props} />}
      {!isLessDesktop && <SteamAccountListItemViewDesktop {...props} />}
    </SteamAccountListItemContext.Provider>
  )
}

export function getActionText({
  farmGamesPending,
  stopFarmPending,
  isFarming,
}: {
  farmGamesPending: boolean
  stopFarmPending: boolean
  isFarming: boolean
}): JSX.Element {
  const Text = React.memo<React.PropsWithChildren>(props => (
    <span className="whitespace-nowrap">{props.children}</span>
  ))

  if (farmGamesPending) return <Text>Começando farm...</Text>
  if (stopFarmPending) return <Text>Parando farm...</Text>
  if (isFarming) return <Text>Parar farm</Text>
  return <Text>Começar farm</Text>
}

export function getFarmedTimeSince(timeInSeconds: number) {
  const timeSince = formatTimeSince(timeInSeconds * 1000)
  const [timeNumber, category, ...secondaryRest] = timeSince.split(" ")

  const highlightTime = [timeNumber, category].join(" ")
  const secondaryTime = secondaryRest.join(" ")

  return {
    highlightTime,
    secondaryTime,
  }
}
