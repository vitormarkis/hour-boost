import { ECacheKeys } from "@/mutations/queryKeys"
import { QueryClient } from "@tanstack/react-query"
import { UserSession } from "core"

export function getUserActionsMakerWrapper(queryClient: QueryClient, userId: string) {
  return function setProvider(setter: (user: UserSession) => UserSession) {
    queryClient.setQueryData<UserSession>(ECacheKeys["user_session"](userId), user => {
      if (!user)
        throw new Error(`There is no user on query provider with key [${ECacheKeys["user_session"](userId)}]`)
      return setter(user!)
    })
  }
}
