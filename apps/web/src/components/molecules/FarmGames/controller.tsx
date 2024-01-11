import { api } from "@/lib/axios"
import { DataOrMessage } from "@/util/DataOrMessage"
import { useAuth } from "@clerk/clerk-react"
import { DefaultError, useMutation } from "@tanstack/react-query"
import { httpFarmGames } from "./httpRequest"

import React, { useContext, useState } from "react"
import { useMediaQuery } from "@/components/hooks"
import { DrawerChooseFarmingGamesView } from "./mobile"
import { ChooseFarmingGamesHelpers, ChooseFarmingGamesViewProps, IntentionCodes } from "./types"
import { SheetChooseFarmingGamesView } from "./desktop"
import { IUserMethods, useUser } from "@/contexts/UserContext"
import { API_GET_RefreshAccountGames } from "core"
import { SteamAccountListItemContext } from "@/components/molecules/SteamAccountListItem/context"
import { toast } from "sonner"
import { AppError } from "@/util/AppError"

export interface FarmGamesPayload {
  accountName: string
  gamesID: number[]
  userId: string
}
export type DrawerSheetChooseFarmingGamesProps = {
  children: React.ReactNode
}

export const DrawerSheetChooseFarmingGames = React.forwardRef<
  React.ElementRef<typeof SheetChooseFarmingGamesView>,
  DrawerSheetChooseFarmingGamesProps
>(function DrawerSheetChooseFarmingGamesComponent({ children }, ref) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 896px)")

  const { accountName, games } = useContext(SteamAccountListItemContext).app
  const { getToken } = useAuth()
  const user = useUser()

  const initialStageFarmingGames = user.steamAccounts.find(sa => sa.accountName === accountName)
    ?.farmingGames!
  const [stageFarmingGames, setStageFarmingGames] = useState<number[]>(initialStageFarmingGames)

  function toggleFarmGame(gameId: number, onError: (error: AppError) => void) {
    setStageFarmingGames(stageFarmingGames => {
      const isAdding = !stageFarmingGames.includes(gameId)
      if (isAdding) {
        if (stageFarmingGames.length >= user.plan.maxGamesAllowed) {
          onError(
            new AppError(
              `Seu plano permite apenas o farm de ${user.plan.maxGamesAllowed} jogos ao mesmo tempo.`
            )
          )
          return stageFarmingGames
        }
        return [...stageFarmingGames, gameId]
      }
      return stageFarmingGames.filter(gid => gid !== gameId)
    })
  }

  const refreshGames = useMutation<API_GET_RefreshAccountGames, unknown, { accountName: string }>({
    async mutationFn({ accountName }) {
      const response = await api.get<API_GET_RefreshAccountGames>(
        `/refresh-games?accountName=${accountName}`,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      )
      return response.data
    },
    onSuccess({ games }, { accountName }) {
      console.log("[user context] got new games, updating user games")
      user.setGames(accountName, games)
    },
    onMutate() {
      console.log("[user context] refreshing the games...")
    },
  })

  function handleRefreshGames() {
    refreshGames.mutate({ accountName })
  }

  const stopFarm = useMutation<IUserMethods.DataOrError, unknown, { accountName: string }>({
    async mutationFn({ accountName }) {
      const response = await api.post(
        "/farm/stop",
        {
          accountName,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      )
      return response.data
    },
  })

  async function handleFarmGames() {
    if (!games) return
    try {
      console.log("[user context] start set farming games...")
      const isStoppingTheFarm = stageFarmingGames.length === 0
      if (isStoppingTheFarm) {
        await stopFarm.mutateAsync({ accountName })
        console.log("[user context] stop the farm")
      } else {
        const [underised] = await farmGames.mutateAsync({
          accountName,
          gamesID: stageFarmingGames,
          userId: user.id,
        })
        if (underised) {
          toast[underised.type](underised.message)
          return
        }
        const gamesNames: string[] = stageFarmingGames.map(gameId => games.find(g => g.id === gameId)!.name)
        toast.success(`Farmando os jogos ${gamesNames.join(", ")}.`)
        console.log("[user context] farmed games")
      }
      user.updateFarmingGames({
        accountName,
        gameIdList: stageFarmingGames,
      })
      setOpen(false)
    } catch (error) {
      toast(error.message)
    }
  }

  function handleStopFarm() {
    setStageFarmingGames([])
  }

  function handleFarmGame(gameId: number) {
    toggleFarmGame(gameId, error => {
      toast.info(error.message)
    })
  }

  const getAPI = async () => {
    api.defaults.headers["Authorization"] = `Bearer ${await getToken()}`
    return api
  }

  const farmGames = useMutation<DataOrMessage<string, IntentionCodes>, DefaultError, FarmGamesPayload>({
    mutationFn: async (...args) => httpFarmGames(...args, getAPI),
  })

  const helpers: ChooseFarmingGamesHelpers = {
    farmGames,
    handleFarmGame,
    handleFarmGames,
    handleRefreshGames,
    handleStopFarm,
    refreshGames,
    stageFarmingGames,
    stopFarm,
  }

  if (isDesktop) {
    return (
      <SheetChooseFarmingGamesView
        ref={ref}
        open={open}
        setOpen={setOpen}
        helpers={helpers}
      >
        {children}
      </SheetChooseFarmingGamesView>
    )
  }

  return (
    <DrawerChooseFarmingGamesView
      ref={ref}
      open={open}
      setOpen={setOpen}
      helpers={helpers}
    >
      {children}
    </DrawerChooseFarmingGamesView>
  )
})

DrawerSheetChooseFarmingGames.displayName = "DrawerSheetChooseFarmingGames"
