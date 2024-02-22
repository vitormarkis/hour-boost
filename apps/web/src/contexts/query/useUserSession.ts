import { api } from "@/lib/axios"
import { ECacheKeys } from "@/mutations/queryKeys"
import { UseSuspenseQueryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { UserSession } from "core"
import { useContext } from "react"
import { UserIdContext } from "../UserContext"
import { useAuth } from "@clerk/clerk-react"
import { GetMeResponse } from "@/pages/dashboard"

type UserQueryOptions<TData = UserSession> = Omit<
  UseSuspenseQueryOptions<UserSession, Error, TData>,
  "queryKey"
>

export function useUserQuery<TData = UserSession>(options = {} as UserQueryOptions<TData>) {
  const { getToken } = useAuth()
  const userId = useContext(UserIdContext)
  return useSuspenseQuery<UserSession, Error, TData>({
    queryKey: ECacheKeys.user_session(userId),
    queryFn: async () => {
      const { data: meResponse } = await api.get<GetMeResponse>("/me", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      })
      return meResponse.userSession
    },
    ...options,
  })
}
