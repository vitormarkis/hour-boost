import { UserAdminPanelSession } from "core"
import { UserAdminActionSetGamesPayload } from "./controller"
import { httpUserAdminActionSetGames } from "./httpRequest"
import { IntentionCodes } from "./types"
import { DataOrMessage } from "@/util/DataOrMessage"
import { DefaultError, useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosInstance } from "axios"
import { produce } from "immer"
import { ECacheKeys } from "@/mutations/queryKeys"

export function useUserAdminActionSetGames(getApi: () => Promise<AxiosInstance>) {
  const queryClient = useQueryClient()

  return useMutation<DataOrMessage<string, IntentionCodes>, DefaultError, UserAdminActionSetGamesPayload>({
    mutationKey: ECacheKeys.setGames,
    mutationFn: async (...args) => httpUserAdminActionSetGames(...args, getApi),
    onSuccess(_, variables) {
      queryClient.setQueryData<UserAdminPanelSession[]>(ECacheKeys["USER-ADMIN-ITEM-LIST"], users => {
        console.log("setting admin item list, updating max allowed games")
        return setGamesLimitMutateUser(users, variables)
      })
    },
  })
}

export type UserAdminActionSetGamesResult = ReturnType<typeof useUserAdminActionSetGames>

function setGamesLimitMutateUser(
  users: UserAdminPanelSession[] | undefined,
  variables: UserAdminActionSetGamesPayload
) {
  if (!users) return
  return produce(users, users => {
    const user = users.find(u => u.id_user === variables.mutatingUserId)!
    user.plan.maxGamesAllowed = variables.newMaxGamesAllowed
  })
}
