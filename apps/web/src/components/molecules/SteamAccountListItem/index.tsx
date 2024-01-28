import { useMediaQuery } from "@/components/hooks"
import { useChangeAccountStatus } from "@/components/molecules/ChangeAccountStatus"
import { IntentionCodes as IntentionCodes_ChangeStatus } from "@/components/molecules/ChangeAccountStatus/types"
import { IntentionCodes, useFarmGamesMutation } from "@/components/molecules/FarmGames"
import { useSteamAccountStore } from "@/components/molecules/SteamAccountListItem/store/useSteamAccountStore"
import { useUser } from "@/contexts/UserContext"
import { api } from "@/lib/axios"
import { useRefreshGamesMutation, useStopFarmMutation } from "@/mutations"
import { DataOrMessage, Message } from "@/util/DataOrMessage"
import { planIsUsage } from "@/util/thisPlanIsUsage"
import { useAuth } from "@clerk/clerk-react"
import { useQueryClient } from "@tanstack/react-query"
import { AppAccountStatus, GameSession, formatTimeSince } from "core"
import React, { useMemo, useState } from "react"
import { ISteamAccountListItemContext, SteamAccountListItemContext } from "./context"
import { SteamAccountListItemViewDesktop } from "./desktop"
import { useHandlers } from "./hooks/useHandlers"
import { SteamAccountListItemViewMobile } from "./mobile"
import { SteamAccountAppProps, SteamAccountListItemViewProps, SteamAccountStatusProps } from "./types"
import { useToggleAutoReloginMutation } from "@/components/molecules/ToggleAutoRelogin/mutation"

export function SteamAccountList({
  app,
  status: statusProps,
}: {
  status: SteamAccountStatusProps
  app: SteamAccountAppProps
}) {
  const [status, setStatusState] = useState<AppAccountStatus>(app.status)
  const [autoRelogin, setAutoRelogin] = useState(app.autoRelogin)
  const { getToken } = useAuth()
  const getAPI = async () => {
    api.defaults.headers["Authorization"] = `Bearer ${await getToken()}`
    return api
  }

  const queryClient = useQueryClient()

  const refreshGames = useRefreshGamesMutation(getAPI)
  const stopFarm = useStopFarmMutation(getAPI)
  const farmGames = useFarmGamesMutation(getAPI)
  const changeAccountStatus = useChangeAccountStatus(getAPI)

  const isLessDesktop = useMediaQuery("(max-width: 896px)")
  const user = useUser()

  const stageFarmingGames_list = useSteamAccountStore(state => state.stageFarmingGames_list)
  const stageFarmingGames_hasGamesOnTheList = useSteamAccountStore(
    state => state.stageFarmingGames_hasGamesOnTheList
  )
  const urgent = useSteamAccountStore(state => state.urgent)
  const setUrgent = useSteamAccountStore(state => state.setUrgent)
  const openModal_desktop = useSteamAccountStore(state => state.openModal_desktop)
  const toggleAutoRelogin = useSteamAccountStore(state => state.toggleAutoRelogin)

  const handlers = useHandlers({
    farmGames,
    queryClient,
    stopFarm,
    user,
    userId: user.id,
  })

  const isFarming = React.useCallback(() => {
    return app.farmingGames.length > 0
  }, [app.farmingGames.length])

  const hasUsagePlanLeft = React.useCallback(() => {
    if (!planIsUsage(user.plan)) return true
    return user.plan.farmUsedTime < user.plan.maxUsageTime
  }, [app.farmedTimeInSeconds])

  /**
   * Toggle Auto Relogin
   */
  const toggleAutoReloginMutation = useToggleAutoReloginMutation(getAPI)

  const handleToggleAutoRelogin = React.useCallback(async () => {
    toggleAutoRelogin()
    const [undesired, result] = await toggleAutoReloginMutation.mutateAsync({
      accountName: app.accountName,
    })
    if (undesired) return
    return result
  }, [toggleAutoReloginMutation, app.accountName])

  /**
   * Farm Games
   */
  const handleClickFarmButton = React.useCallback(async (): Promise<
    DataOrMessage<{ list: number[]; games: GameSession[] } | Message, IntentionCodes>
  > => {
    if (isFarming()) {
      const { dataOrMessage } = await handlers.handleStopFarm(app.accountName)
      const [undesired] = dataOrMessage
      if (undesired) return [undesired]
      return [null, new Message("Farm pausado.", "info")]
    }
    if (!stageFarmingGames_hasGamesOnTheList()) {
      setUrgent(true)
      openModal_desktop()

      return [new Message("Escolha alguns jogos primeiro.", "info")]
    }
    if (!app.games) {
      return [
        new Message("Nenhum jogo foi encontrado na sua conta, atualize seus jogos ou a página.", "error"),
      ]
    }
    const { dataOrMessage } = await handlers.handleFarmGames(app.accountName, stageFarmingGames_list, user.id)
    const [undesired] = dataOrMessage
    if (undesired) return [undesired]
    return [null, { list: stageFarmingGames_list, games: app.games }]
  }, [
    handlers.handleStopFarm,
    app.accountName,
    stageFarmingGames_hasGamesOnTheList,
    urgent,
    openModal_desktop,
    app.games,
    handlers.handleFarmGames,
    stageFarmingGames_list,
  ])

  const handleChangeStatus = React.useCallback(
    async (newStatus: AppAccountStatus) => {
      const [error, result] = await changeAccountStatus.mutateAsync({
        accountName: app.accountName,
        status: newStatus,
      })
      if (error) return [error] as DataOrMessage<string, IntentionCodes_ChangeStatus>
      setStatusState(newStatus)
      return [null, result] as DataOrMessage<string, IntentionCodes_ChangeStatus>
    },
    [changeAccountStatus, app.accountName]
  )

  const value: ISteamAccountListItemContext = useMemo(
    () => ({
      handleChangeStatus,
      handleToggleAutoRelogin,
      ...statusProps,
      mutations: {
        farmGames,
        refreshGames,
        stopFarm,
        changeAccountStatus,
        toggleAutoRelogin: toggleAutoReloginMutation,
      },
      isFarming,
      hasUsagePlanLeft,
      handlers,
      app,
      status,
      farmingTime: 0,
    }),
    [
      statusProps,
      farmGames,
      refreshGames,
      stopFarm,
      changeAccountStatus,
      app.farmingGames.length,
      handlers,
      app,
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
