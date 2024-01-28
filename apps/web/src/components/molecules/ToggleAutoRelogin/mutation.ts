import { DataOrMessage } from "@/util/DataOrMessage"
import { DefaultError, useMutation } from "@tanstack/react-query"
import { AxiosInstance } from "axios"
import { ToggleAutoReloginPayload } from "./controller"
import { httpToggleAutoRelogin } from "./httpRequest"
import { IntentionCodes } from "./types"

export function useToggleAutoReloginMutation(getApi: () => Promise<AxiosInstance>) {
  return useMutation<DataOrMessage<string, IntentionCodes>, DefaultError, ToggleAutoReloginPayload>({
    mutationFn: async (...args) => httpToggleAutoRelogin(...args, getApi),
  })
}

export type ToggleAutoReloginMutationResult = ReturnType<typeof useToggleAutoReloginMutation>
