import { ECacheKeys } from "@/mutations/queryKeys"
import { UserAdminPanelSession } from "@/pages/admin"
import { useQuery } from "@tanstack/react-query"
import React from "react"
import { UserAdminItemProvider } from "./context"

export type UserAdminItemListProviderProps = {
  children?: React.ReactNode | null
  user: UserAdminPanelSession
}

export const UserAdminItemListProvider: React.FC<UserAdminItemListProviderProps> = ({ user, children }) => {
  return <UserAdminItemProvider value={user}>{children}</UserAdminItemProvider>
}

UserAdminItemListProvider.displayName = "UserAdminItemListProvider"

export function useCacheUserItem(userId: string) {
  return useQuery<UserAdminPanelSession[], unknown, UserAdminPanelSession | undefined>({
    queryKey: [...ECacheKeys["USER-ADMIN-ITEM-LIST"], userId],
    select: users => users.find(user => user.id_user === userId),
  })
}
// const queryClient = useQueryClient()
// const users = queryClient.getQueryData<UserAdminPanelSession[]>(ECacheKeys["USER-ADMIN-ITEM-LIST"])!
// console.log({
//   users,
// })
// return users.find(user => user.id_user === userId)!
// }

// export const UserAdminItemListProvider: React.FC<UserAdminItemListProviderProps> = ({ user, children }) => {
//   return (

//   )
// }
