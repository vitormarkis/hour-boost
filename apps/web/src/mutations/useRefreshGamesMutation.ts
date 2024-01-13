import { useMutation } from "@tanstack/react-query"
import { API_GET_RefreshAccountGames } from "core"

import { AxiosInstance } from "axios"
export function useRefreshGamesMutation(getApi: () => Promise<AxiosInstance>) {
  return useMutation<API_GET_RefreshAccountGames, unknown, { accountName: string }>({
    async mutationFn({ accountName }) {
      const api = await getApi()
      const response = await api.get<API_GET_RefreshAccountGames>(`/refresh-games?accountName=${accountName}`)
      return response.data
    },
  })
}
