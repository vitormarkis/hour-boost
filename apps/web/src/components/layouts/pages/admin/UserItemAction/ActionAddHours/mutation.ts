import { ECacheKeys } from "@/mutations/queryKeys"
import { UserAdminActionAddHoursPayload } from "./controller"
import { httpUserAdminActionAddHours } from "./httpRequest"
import { IntentionCodes } from "./types"
import { DataOrMessage } from "@/util/DataOrMessage"
import { DefaultError, useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosInstance } from "axios"
import { UserAdminPanelSession } from "@/pages/admin"
import { produce } from "immer"
import { api } from "@/lib/axios"
import { useAuth } from "@clerk/clerk-react"

export function useUserAdminActionAddHours() {
  const queryClient = useQueryClient()
  const { getAPI } = useGetAPI()

  return useMutation<DataOrMessage<string, IntentionCodes>, DefaultError, UserAdminActionAddHoursPayload>({
    mutationKey: ECacheKeys.addHours,
    mutationFn: async (...args) => httpUserAdminActionAddHours(...args, getAPI),
    onSuccess(_, variables) {
      queryClient.setQueryData<UserAdminPanelSession[]>(ECacheKeys["USER-ADMIN-ITEM-LIST"], users => {
        return produce(users, users => {
          const user = users!.find(u => u.id_user === variables.userId)!
          user.plan.maxUsageTime += variables.hoursAddingInSeconds
        })
      })
    },
  })
}

export type UserAdminActionAddHoursResult = ReturnType<typeof useUserAdminActionAddHours>

export function useGetAPI() {
  const { getToken } = useAuth()
  const getAPI = async () => {
    api.defaults.headers["Authorization"] = `Bearer ${await getToken()}`
    return api
  }

  return { getAPI }
}
