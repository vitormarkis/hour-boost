import { Helper } from "@/contexts/UserContext.helper"
import { api } from "@/lib/axios"
import { useAuth } from "@clerk/clerk-react"
import { useQuery } from "@tanstack/react-query"
import { GameSession, Persona, UserSession } from "core"
import React, { createContext, useContext, useState } from "react"

export interface IUserContext extends UserSession, UserMethods {}
export interface UserMethods {
  setGames(accountName: string, games: GameSession[]): void
  updatePersona(accountName: string, persona: Persona): void
  hasGames(): boolean
  updateFarmingGames(props: IUserMethods.UpdateFarmingGames): void
}

export interface IUserProviderProps {
  children: React.ReactNode
  serverUser: UserSession
}

export const UserContext = createContext<IUserContext>({} as IUserContext)

export function UserProvider({ serverUser, children }: IUserProviderProps) {
  const [user, setUser] = useState(serverUser)
  const { getToken } = useAuth()

  function update(newUser: UserSession) {
    setUser(oldUser => new Helper(oldUser).udpate(newUser))
  }

  const { data } = useQuery<UserSession>({
    queryKey: ["me", user.id],
    queryFn: async () => {
      const token = await getToken()
      const { data: user } = await api.get<UserSession>("/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log("Queried User, and update the internal state")
      update(user)
      return user
    },
    initialData: user,
    refetchOnWindowFocus: false,
  })

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
        updateFarmingGames: ({ accountName, gameIdList }) => {
          setUser(user => new Helper(user).updateFarmingGames(accountName, gameIdList))
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
