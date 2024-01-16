import { FarmGamesPayload } from "@/components/molecules/FarmGames/controller"
import { httpFarmGames } from "@/components/molecules/FarmGames/httpRequest"
import { IntentionCodes } from "@/components/molecules/FarmGames/types"
import { DataOrMessage } from "@/util/DataOrMessage"
import { DefaultError, useMutation } from "@tanstack/react-query"
import { AxiosInstance } from "axios"

export function useFarmGamesMutation(getApi: () => Promise<AxiosInstance>) {
  return useMutation<DataOrMessage<string, IntentionCodes>, DefaultError, FarmGamesPayload>({
    mutationFn: async (...args) => httpFarmGames(...args, getApi),
  })
}

export type FarmGamesMutationResult = ReturnType<typeof useFarmGamesMutation>
