import { api } from "@/lib/axios"
import { ECacheKeys } from "@/mutations/queryKeys"
import { QueryObserverOptions, useQuery } from "@tanstack/react-query"
import { UserSession } from "core"

export function useUserSessionQuery({ initialData, userId, onSuccess }: UseUserSessionQueryProps) {
  const options: QueryObserverOptions<UserSession> = {
    queryFn: async () => {
      const { data: user } = await api.get<UserSession>("/me")
      console.log("Queried User, and update the internal state")
      onSuccess(user)
      return user
    },
    initialData,
    refetchOnWindowFocus: false,
  }

  return useUserSession({ userId, options })
}

export function useUserSession<TData = UserSession>({ userId, options = {} }: UseUserSessionProps<TData>) {
  return useQuery<UserSession, unknown, TData>({
    queryKey: ECacheKeys.user_session(userId),
    ...options,
  })
}

type UseUserSessionQueryProps = {
  userId: string
  onSuccess(user: UserSession): void
  initialData: UserSession
}

type UseUserSessionProps<TData = UserSession> = {
  userId: string
  options?: QueryObserverOptions<UserSession, unknown, TData>
}
