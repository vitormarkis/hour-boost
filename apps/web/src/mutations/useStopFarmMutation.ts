import { IUserMethods } from "@/contexts/UserContext"
import { useMutation } from "@tanstack/react-query"
import { AxiosInstance } from "axios"

export function useStopFarmMutation(getApi: () => Promise<AxiosInstance>) {
  return useMutation<IUserMethods.DataOrError, unknown, { accountName: string }>({
    async mutationFn({ accountName }) {
      const api = await getApi()
      const response = await api.post("/farm/stop", {
        accountName,
      })
      return response.data
    },
  })
}
