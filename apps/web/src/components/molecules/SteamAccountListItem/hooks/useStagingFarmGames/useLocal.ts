import React from "react"

type Props = {
  list: number[]
}

export function useLocal({ list }: Props): HLocal {
  const amount = React.useMemo(() => list.length, [list])
  const hasGame = React.useCallback((gameId: number): boolean => list.includes(gameId), [list])
  const hasGamesInList = React.useCallback(() => list.length > 0, [list])

  return {
    amount,
    hasGame,
    hasGamesInList,
    list,
  }
}

export interface HLocal {
  list: number[]
  hasGame(gameId: number): boolean
  hasGamesInList(): boolean
  amount: number
}
