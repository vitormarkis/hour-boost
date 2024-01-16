import { StopFarmPayload } from "@/components/molecules/StopFarm/controller"
import { httpStopFarm } from "@/components/molecules/StopFarm/httpRequest"
import { IntentionCodes } from "@/components/molecules/StopFarm/types"
import { DataOrMessage } from "@/util/DataOrMessage"
import { DefaultError, useMutation } from "@tanstack/react-query"
import { AxiosInstance } from "axios"

export function useStopFarmMutation(getApi: () => Promise<AxiosInstance>) {
  return useMutation<DataOrMessage<string, IntentionCodes>, DefaultError, StopFarmPayload>({
    mutationFn: async (...args) => httpStopFarm(...args, getApi),
  })
}

export type StopFarmMutationResult = ReturnType<typeof useStopFarmMutation>
