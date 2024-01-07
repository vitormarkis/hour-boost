import { api } from "@/lib/axios"
import { DataOrMessage } from "@/util/DataOrMessage"
import { useAuth } from "@clerk/clerk-react"
import { DefaultError, useMutation } from "@tanstack/react-query"
import { httpFarmGames } from "./httpRequest"
import {
  DrawerSheetChooseFarmingGamesView,
  DrawerSheetChooseFarmingGamesViewProps,
  IntentionCodes,
} from "./view"

import React from "react"

export interface FarmGamesPayload {
  accountName: string
  gamesID: number[]
  userId: string
}
export type DrawerSheetChooseFarmingGamesProps = DrawerSheetChooseFarmingGamesViewProps

export const DrawerSheetChooseFarmingGames = React.forwardRef<
  React.ElementRef<typeof DrawerSheetChooseFarmingGamesView>,
  DrawerSheetChooseFarmingGamesProps
>(function DrawerSheetChooseFarmingGamesComponent(props, ref) {
  const { getToken } = useAuth()
  const getAPI = async () => {
    api.defaults.headers["Authorization"] = `Bearer ${await getToken()}`
    return api
  }

  const farmGames = useMutation<DataOrMessage<string, IntentionCodes>, DefaultError, FarmGamesPayload>({
    mutationFn: async (...args) => httpFarmGames(...args, getAPI),
  })

  return (
    <DrawerSheetChooseFarmingGamesView
      {...props}
      ref={ref}
      farmGames={farmGames}
    />
  )
})

DrawerSheetChooseFarmingGames.displayName = "DrawerSheetChooseFarmingGames"
