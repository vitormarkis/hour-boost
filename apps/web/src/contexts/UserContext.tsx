import {
  Helper,
  addGameToStageFarmingGames,
  removeGameToStageFarmingGames,
} from "@/contexts/UserContext.helper"
import { GameSession, Persona, UserSession } from "core"
import React, { createContext, useContext, useState } from "react"

export interface IUserContext extends UserSession, UserMethods {}
export interface UserMethods {
  setGames(accountName: string, games: GameSession[]): void
  updatePersona(accountName: string, persona: Persona): void
  hasGames(): boolean
  updateFarmingGames(props: IUserMethods.UpdateFarmingGames): void
  getStageFarmingGames(accountName: string): {
    stageFarmingGames: number[]
    toggleFarmGame(gameId: number, onError: IUserMethods.OnError): void
  }
}

export interface IUserProviderProps {
  children: React.ReactNode
  serverUser: UserSession
}

export const UserContext = createContext<IUserContext>({} as IUserContext)

export function UserProvider({ serverUser, children }: IUserProviderProps) {
  const [user, setUser] = useState(serverUser)
  const [allStageFarmingGames, setAllStageFarmingGames] = useState<NSUserContext.StageFarmingGames[]>(
    user.steamAccounts.map(sa => ({
      accountName: sa.accountName,
      stageFarmingGames: sa.farmingGames,
    }))
  )

  return (
    <UserContext.Provider
      value={{
        ...user,
        setGames: (accountName, games) => {
          setUser(user => new Helper(user).setGames(accountName, games))
        },
        updatePersona: (accountName, persona) => {
          setUser(user => new Helper(user).updatePersona(accountName, persona))
        },
        hasGames: () => new Helper(user).hasGames(),
        updateFarmingGames() {},
        getStageFarmingGames(accountName: string) {
          const { stageFarmingGames } = allStageFarmingGames.find(stage => stage.accountName === accountName)!
          function toggleFarmGame(gameId: number, onError: IUserMethods.OnError) {
            setAllStageFarmingGames(allStageFarmingGames => {
              const isAdding = !stageFarmingGames.includes(gameId)
              if (isAdding) {
                if (stageFarmingGames.length >= user.plan.maxGamesAllowed) {
                  onError({
                    message: `Você só pode farmar ${user.plan.maxGamesAllowed} jogos por vez.`,
                  })
                  return allStageFarmingGames
                }
                return addGameToStageFarmingGames(allStageFarmingGames, accountName, gameId)
              }

              return removeGameToStageFarmingGames(allStageFarmingGames, accountName, gameId)
            })
          }

          return {
            stageFarmingGames,
            toggleFarmGame,
          }
        },
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)

export namespace NSUserContext {
  export interface StageFarmingGames {
    accountName: string
    stageFarmingGames: number[]
  }
}

export namespace IUserMethods {
  export interface FarmGames {
    accountName: string
    gameId: number
  }

  export interface UpdateFarmingGames {
    accountName: string
    gameIdList: number[]
  }

  type Error = {
    message: string
  }

  export type DataOrError = [error: Error, data: null] | [error: null, data: UserSession]

  export type OnError = (error: Error) => void
}
