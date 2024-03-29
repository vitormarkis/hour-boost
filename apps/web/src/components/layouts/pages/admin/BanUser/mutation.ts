import { api } from "@/lib/axios"
import { ECacheKeys } from "@/mutations/queryKeys"
import { DataOrMessage } from "@/util/DataOrMessage"
import { useAuth } from "@clerk/clerk-react"
import { DefaultError, useMutation, useQueryClient } from "@tanstack/react-query"
import { UserAdminActionBanUserPayload } from "./controller"
import { httpUserAdminActionBanUser } from "./httpRequest"
import { IntentionCodes } from "./types"
import { UserAdminPanelSession } from "core"
import { produce } from "immer"

type UseUserAdminActionBanUserProps = {
  userId: string
}

export function useUserAdminActionBanUser({ userId }: UseUserAdminActionBanUserProps) {
  const queryClient = useQueryClient()
  return useMutation<DataOrMessage<string, IntentionCodes>, DefaultError, UserAdminActionBanUserPayload>({
    mutationKey: ECacheKeys.banUser(userId),
    mutationFn: async (...args) => httpUserAdminActionBanUser(...args),
    onSuccess(_, variables) {
      queryClient.setQueryData<UserAdminPanelSession[]>(ECacheKeys["USER-ADMIN-ITEM-LIST"], users => {
        return produce(users, users => {
          const user = users!.find(u => u.id_user === variables.userId)!
          user.status = "BANNED"
        })
      })
    },
  })
}

export type UserAdminActionBanUserResult = ReturnType<typeof useUserAdminActionBanUser>

export function useGetAPI() {
  const { getToken } = useAuth()
  const getAPI = async () => {
    api.defaults.headers["Authorization"] = `Bearer ${await getToken()}`
    return api
  }

  return { getAPI }
}
