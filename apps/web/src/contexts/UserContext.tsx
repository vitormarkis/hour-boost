import { Helper } from "@/contexts/UserContext.helper"
import { GameWithAccountName, UserSession } from "core"
import React, { createContext, useContext, useState } from "react"

export interface IUserContext extends UserSession, UserMethods {}
export interface UserMethods {
  appendGames(games: GameWithAccountName[]): void
}

export interface IUserProviderProps {
  children: React.ReactNode
  serverUser: UserSession
}

export const UserContext = createContext<IUserContext | null>(null)

export function UserProvider({ serverUser, children }: IUserProviderProps) {
  const [user, setUser] = useState(serverUser)

  return (
    <UserContext.Provider
      value={{
        ...user,
        appendGames: games => {
          setUser(user => new Helper(user).appendGames(games))
        },
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
