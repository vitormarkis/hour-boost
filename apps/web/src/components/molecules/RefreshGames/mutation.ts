import { DefaultError, useMutation } from "@tanstack/react-query"
import { AxiosInstance } from "axios"

import { DataOrMessage } from "@/util/DataOrMessage"
import { RefreshGamesPayload } from "./controller"
import { httpRefreshGames } from "./httpRequest"
import { IntentionCodes } from "./types"

export function useRefreshGames(getApi: () => Promise<AxiosInstance>) {
  return useMutation<DataOrMessage<string, IntentionCodes>, DefaultError, RefreshGamesPayload>({
    mutationFn: async (...args) => httpRefreshGames(...args, getApi),
  })
}

export type RefreshGamesMutationResult = ReturnType<typeof useRefreshGames>

export function useRefreshGamesMutation(getApi: () => Promise<AxiosInstance>) {
  return useMutation<DataOrMessage<string, IntentionCodes>, DefaultError, RefreshGamesPayload>({
    mutationFn: async (...args) => httpRefreshGames(...args, getApi),
  })
}
