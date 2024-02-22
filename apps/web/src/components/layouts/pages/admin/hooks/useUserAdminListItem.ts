import { UserAdminPanelSession } from "core"
import { useUserAdminList } from "./useUserAdminList"

export function useUserAdminListItem<Selected = UserAdminPanelSession>(
  userId: string,
  select?: (user: UserAdminPanelSession) => Selected
) {
  const query = useUserAdminList<Selected>({
    select: userList => {
      const foundUser = userList.find(u => u.id_user === userId)!
      return select ? select(foundUser) : (foundUser as Selected)
    },
  })

  return query.data
}
