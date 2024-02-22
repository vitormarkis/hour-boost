import { DataOrMessage } from "@/util/DataOrMessage"
import { DefaultError, useMutation } from "@tanstack/react-query"
import { ToggleAutoReloginPayload } from "./controller"
import { httpToggleAutoRelogin } from "./httpRequest"
import { IntentionCodes } from "./types"
import { useUserControl } from "@/contexts/hook"
import { AxiosInstance } from "axios"

export function useToggleAutoReloginMutation(accountName: string, getApi: () => Promise<AxiosInstance>) {
  const toggleAutoRestart = useUserControl(control => control.toggleAutoRestart)

  return useMutation<DataOrMessage<string, IntentionCodes>, DefaultError, ToggleAutoReloginPayload>({
    mutationFn: async (...args) => httpToggleAutoRelogin(...args, getApi),
    onSuccess() {
      toggleAutoRestart(accountName)
    },
  })
}

export type ToggleAutoReloginMutationResult = ReturnType<typeof useToggleAutoReloginMutation>
