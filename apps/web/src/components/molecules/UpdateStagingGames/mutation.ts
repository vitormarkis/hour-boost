import { UpdateStagingGamesPayload } from "@/components/molecules/UpdateStagingGames/controller"
import { httpUpdateStagingGames } from "@/components/molecules/UpdateStagingGames/httpRequest"
import { IntentionCodes } from "@/components/molecules/UpdateStagingGames/types"
import { DataOrMessage } from "@/util/DataOrMessage"
import { DefaultError, useMutation } from "@tanstack/react-query"
import { AxiosInstance } from "axios"

export function useUpdateStagingGames(getApi: () => Promise<AxiosInstance>) {
  return useMutation<DataOrMessage<string, IntentionCodes>, DefaultError, UpdateStagingGamesPayload>({
    mutationFn: async (...args) => httpUpdateStagingGames(...args, getApi),
  })
}

export type UpdateStagingGamesMutationResult = ReturnType<typeof useUpdateStagingGames>
