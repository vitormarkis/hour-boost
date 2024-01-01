import { Helper } from "@/contexts/UserContext.helper"
import { GameSession, Persona, UserSession } from "core"
import React, { createContext, useContext, useState } from "react"

export interface IUserContext extends UserSession, UserMethods {}
export interface UserMethods {
  setGames(accountName: string, games: GameSession[]): void
  updatePersona(accountName: string, persona: Persona): void
  hasGames(): boolean
  farmGames(props: IUserMethods.FarmGames, onError: IUserMethods.OnError): void
}

export interface IUserProviderProps {
  children: React.ReactNode
  serverUser: UserSession
}

export const UserContext = createContext<IUserContext>({} as IUserContext)

export function UserProvider({ serverUser, children }: IUserProviderProps) {
  const [user, setUser] = useState(serverUser)

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
        farmGames: ({ accountName, gamesIdList }, onError) => {
          setUser(user => {
            const [error, updatedUser] = new Helper(user).farmGames(accountName, gamesIdList)
            if (error) {
              onError(error)
              return user
            }
            return updatedUser
          })
        },
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)

export namespace IUserMethods {
  export interface FarmGames {
    accountName: string
    gamesIdList: number[]
  }

  type Error = {
    message: string
  }

  export type DataOrError = [error: Error, data: null] | [error: null, data: UserSession]

  export type OnError = (error: Error) => void
}
