import { ChangeAccountStatusPayload } from "@/components/molecules/ChangeAccountStatus/controller"
import { httpChangeAccountStatus } from "@/components/molecules/ChangeAccountStatus/httpRequest"
import { IntentionCodes } from "@/components/molecules/ChangeAccountStatus/types"
import { DataOrMessage } from "@/util/DataOrMessage"
import { DefaultError, useMutation } from "@tanstack/react-query"
import { AxiosInstance } from "axios"

export function useChangeAccountStatus(getApi: () => Promise<AxiosInstance>) {
  return useMutation<DataOrMessage<string, IntentionCodes>, DefaultError, ChangeAccountStatusPayload>({
    mutationFn: async (...args) => httpChangeAccountStatus(...args, getApi),
  })
}

export type ChangeAccountStatusMutationResult = ReturnType<typeof useChangeAccountStatus>
