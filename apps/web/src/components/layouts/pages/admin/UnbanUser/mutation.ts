import { ECacheKeys } from "@/mutations/queryKeys"
import { UserAdminActionUnbanUserPayload } from "./controller"
import { httpUserAdminActionUnbanUser } from "./httpRequest"
import { IntentionCodes } from "./types"
import { DataOrMessage } from "@/util/DataOrMessage"
import { DefaultError, useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosInstance } from "axios"
import { UserAdminPanelSession } from "@/pages/admin"
import { produce } from "immer"
import { api } from "@/lib/axios"
import { useAuth } from "@clerk/clerk-react"
import { planIsUsage } from "@/util/thisPlanIsUsage"

type UseUserAdminActionUnbanUserProps = {
  userId: string
}

export function useUserAdminActionUnbanUser({ userId }: UseUserAdminActionUnbanUserProps) {
  const queryClient = useQueryClient()
  const { getAPI } = useGetAPI()

  return useMutation<DataOrMessage<string, IntentionCodes>, DefaultError, UserAdminActionUnbanUserPayload>({
    mutationKey: ECacheKeys.unbanUser(userId),
    mutationFn: async (...args) => httpUserAdminActionUnbanUser(...args, getAPI),
    onSuccess(_, variables) {
      queryClient.setQueryData<UserAdminPanelSession[]>(ECacheKeys["USER-ADMIN-ITEM-LIST"], users => {
        return produce(users, users => {
          const user = users!.find(u => u.id_user === variables.userId)!
          user.status = "ACTIVE"
        })
      })
    },
  })
}

export type UserAdminActionUnbanUserResult = ReturnType<typeof useUserAdminActionUnbanUser>

export function useGetAPI() {
  const { getToken } = useAuth()
  const getAPI = async () => {
    api.defaults.headers["Authorization"] = `Bearer ${await getToken()}`
    return api
  }

  return { getAPI }
}
