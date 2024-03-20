import { ECacheKeys } from "@/mutations/queryKeys"
import { DataOrMessage } from "@/util/DataOrMessage"
import { DefaultError, useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosInstance } from "axios"
import { UserAdminPanelSession } from "core"
import { produce } from "immer"
import { UserAdminActionSetAccountsPayload } from "./controller"
import { httpUserAdminActionSetAccounts } from "./httpRequest"
import { IntentionCodes } from "./types"

export function useUserAdminActionSetAccounts(getApi: () => Promise<AxiosInstance>) {
  const queryClient = useQueryClient()

  return useMutation<DataOrMessage<string, IntentionCodes>, DefaultError, UserAdminActionSetAccountsPayload>({
    mutationKey: ECacheKeys.setAccounts,
    mutationFn: async (...args) => httpUserAdminActionSetAccounts(...args, getApi),
    onSuccess(_, variables) {
      queryClient.setQueryData<UserAdminPanelSession[]>(ECacheKeys["USER-ADMIN-ITEM-LIST"], users => {
        return produce(users, users => {
          const user = users!.find(u => u.id_user === variables.userId)!
          user.plan.maxSteamAccounts = variables.newAccountsLimit
        })
      })
    },
  })
}

export type UserAdminActionSetAccountsResult = ReturnType<typeof useUserAdminActionSetAccounts>
