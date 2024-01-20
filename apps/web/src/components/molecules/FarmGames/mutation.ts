import { DataOrMessage } from "@/util/DataOrMessage"
import { DefaultError, useMutation } from "@tanstack/react-query"
import { AxiosInstance } from "axios"
import { FarmGamesPayload } from "./controller"
import { httpFarmGames } from "./httpRequest"
import { IntentionCodes } from "./types"

export function useFarmGamesMutation(getApi: () => Promise<AxiosInstance>) {
  return useMutation<DataOrMessage<string, IntentionCodes>, DefaultError, FarmGamesPayload>({
    mutationFn: async (...args) => httpFarmGames(...args, getApi),
  })
}

export type FarmGamesMutationResult = ReturnType<typeof useFarmGamesMutation>
