import { api } from "@/lib/axios"
import { useAuth } from "@clerk/clerk-react"

import React, { useContext, useState } from "react"
import { useMediaQuery } from "@/components/hooks"
import { DrawerChooseFarmingGamesView } from "./mobile"
import { ChooseFarmingGamesHelpers } from "./types"
import { SheetChooseFarmingGamesView } from "./desktop"
import { useUser } from "@/contexts/UserContext"
import { SteamAccountListItemContext } from "@/components/molecules/SteamAccountListItem/context"
import { toast } from "sonner"
import { AppError } from "@/util/AppError"
import { useFarmGamesMutation, useRefreshGamesMutation, useStopFarmMutation } from "@/mutations"

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
  const { modalSelectGames } = useContext(SteamAccountListItemContext)
  const { closeModal, state } = modalSelectGames
  const isLessDesktop = useMediaQuery("(max-width: 896px)")

  const { accountName, games } = useContext(SteamAccountListItemContext).app
  const { getToken } = useAuth()
  const user = useUser()

  const initialStageFarmingGames = user.steamAccounts.find(sa => sa.accountName === accountName)
    ?.farmingGames!
  const [stageFarmingGames, setStageFarmingGames] = useState<number[]>(initialStageFarmingGames)

  const getAPI = async () => {
    api.defaults.headers["Authorization"] = `Bearer ${await getToken()}`
    return api
  }

  const refreshGames = useRefreshGamesMutation(getAPI)
  const stopFarm = useStopFarmMutation(getAPI)
  const farmGames = useFarmGamesMutation(getAPI)

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

  async function handleRefreshGames() {
    const { games } = await refreshGames.mutateAsync({ accountName })
    user.setGames(accountName, games)
  }

  async function handleFarmGames() {
    if (!games) return
    try {
      const isStoppingTheFarm = stageFarmingGames.length === 0
      if (isStoppingTheFarm) {
        await stopFarm.mutateAsync({ accountName })
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
        const now = new Date()
        console.log("Starting the farm with the props: ", {
          accountName,
          when: now,
        })
        user.startFarm({
          accountName,
          when: now,
        })
        const gamesNames: string[] = stageFarmingGames.map(gameId => games.find(g => g.id === gameId)!.name)
        toast.success(`Farmando os jogos ${gamesNames.join(", ")}.`)
        console.log("[user context] farmed games")
      }
      user.updateFarmingGames({
        accountName,
        gameIdList: stageFarmingGames,
      })
      closeModal()
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

  if (isLessDesktop) {
    return (
      <DrawerChooseFarmingGamesView
        state={state}
        ref={ref}
        helpers={helpers}
      >
        {children}
      </DrawerChooseFarmingGamesView>
    )
  }

  return (
    <SheetChooseFarmingGamesView
      state={state}
      ref={ref}
      helpers={helpers}
    >
      {children}
    </SheetChooseFarmingGamesView>
  )
})

DrawerSheetChooseFarmingGames.displayName = "DrawerSheetChooseFarmingGames"
