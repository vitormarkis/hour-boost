import { UserAdminPanelSession } from "@/pages/admin"
import React from "react"
import { createContext, useContextSelector } from "use-context-selector"

export interface IUserAdminItemProviderProps {
  value: UserAdminPanelSession
  children: React.ReactNode
}

type CUserAdminPanelSession = UserAdminPanelSession | null

export const UserAdminItemContext = createContext<CUserAdminPanelSession>(null)

export function UserAdminItemProvider(props: IUserAdminItemProviderProps) {
  return <UserAdminItemContext.Provider {...props} />
}

export function useUserAdminItem<Selected>(selector: (user: UserAdminPanelSession) => Selected) {
  return useContextSelector<CUserAdminPanelSession, Selected>(UserAdminItemContext, selector)
}
