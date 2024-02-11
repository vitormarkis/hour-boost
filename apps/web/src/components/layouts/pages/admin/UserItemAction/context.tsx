import React from "react"
import { createContext, useContextSelector } from "use-context-selector"

export interface IUserAdminIdProviderProps {
  userId: string
  children: React.ReactNode
}

type CUserAdminPanelSession = string | null

export const UserAdminItemContext = createContext<CUserAdminPanelSession>(null)

export function UserAdminIdProvider({ children, userId }: IUserAdminIdProviderProps) {
  return <UserAdminItemContext.Provider value={userId}>{children}</UserAdminItemContext.Provider>
}

export function useUserAdminItemId() {
  const userIdContext = useContextSelector(UserAdminItemContext, id => id)
  if (!userIdContext) throw new Error("admin userId ooc")
  return userIdContext
}
