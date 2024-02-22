import { api } from "@/lib/axios"
import { ECacheKeys } from "@/mutations/queryKeys"
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { GameSession, Persona, SteamAccountSession, UserSession } from "core"
import React, { PropsWithChildren, createContext, useContext } from "react"
import { createContext as createContextSelector } from "use-context-selector"
import { createUserActions } from "./controls"
import { useUserQuery } from "./query/useUserSession"

export interface IUserContext extends UserSession, UserMethods {}
export namespace NSUserMethods {
  export type StartFarmProps = {
    when: string
    accountName: string
  }
}

export interface UserMethods {
  setGames(accountName: string, games: GameSession[]): void
  updatePersona(accountName: string, persona: Persona): void
  hasGames(): boolean
  updateFarmingGames(props: IUserMethods.UpdateFarmingGames): void
  isFarming(): boolean
  hasAccounts(): boolean
  startFarm(props: NSUserMethods.StartFarmProps): void
}

export interface IUserProviderProps {
  children: React.ReactNode
  serverUser: UserSession
  serverHeaders: Record<string, string>
}

export const UserContext = createContext<IUserContext>({} as IUserContext)
export const UserControlContext = createContextSelector<UserControl | null>(null)
export const UserIdContext = createContext("")

export function UserProvider({ serverUser, serverHeaders, children }: IUserProviderProps) {
  api.defaults.headers.common = {
    ...api.defaults.headers.common,
    ...serverHeaders,
  }

  return (
    <UserIdContext.Provider value={serverUser.id}>
      <ControlProvider serverUser={serverUser}>{children}</ControlProvider>
    </UserIdContext.Provider>
  )
}

type ControlProviderProps = PropsWithChildren & {
  serverUser: UserSession
}

export function ControlProvider({ serverUser, children }: ControlProviderProps) {
  const queryClient = useQueryClient()

  useUserQuery({
    initialData: serverUser,
  })

  return (
    <UserControlContext.Provider value={createUserActions(queryClient, serverUser.id)}>
      {children}
    </UserControlContext.Provider>
  )
}

export function useUser<Select>(select: (user: UserSession) => Select) {
  return useUserQuery<Select>({
    select,
  }).data
}

export function useUserId() {
  return useContext(UserIdContext)
}

export type UserControl = ReturnType<typeof createUserActions>

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
