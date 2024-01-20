import { ChooseFarmingGamesHelpers } from "@/components/molecules/FarmGames/types"
import React, { createContext, useContext } from "react"

export interface IFarmGamesContext {
  helpers: ChooseFarmingGamesHelpers
}

export interface IFarmGamesProviderProps {
  children: React.ReactNode
}

export const FarmGamesContext = createContext({} as IFarmGamesContext)

export function useFarmGames<R>(): IFarmGamesContext
export function useFarmGames<R>(selector: (context: IFarmGamesContext) => R): R
export function useFarmGames(selector?: (...args: any[]) => any) {
  const context = useContext(FarmGamesContext)
  return selector ? selector(context) : context
}
