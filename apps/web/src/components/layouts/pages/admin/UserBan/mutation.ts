import { ECacheKeys } from "@/mutations/queryKeys"
import { UserAdminActionBanUserPayload } from "./controller"
import { httpUserAdminActionBanUser } from "./httpRequest"
import { IntentionCodes } from "./types"
import { DataOrMessage } from "@/util/DataOrMessage"
import { DefaultError, useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosInstance } from "axios"
import { UserAdminPanelSession } from "@/pages/admin"
import { produce } from "immer"
import { api } from "@/lib/axios"
import { useAuth } from "@clerk/clerk-react"
import { planIsUsage } from "@/util/thisPlanIsUsage"

export function useUserAdminActionBanUser() {
  const queryClient = useQueryClient()
  const { getAPI } = useGetAPI()

  return useMutation<DataOrMessage<string, IntentionCodes>, DefaultError, UserAdminActionBanUserPayload>({
    mutationKey: ECacheKeys.banUser,
    mutationFn: async (...args) => httpUserAdminActionBanUser(...args, getAPI),
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
