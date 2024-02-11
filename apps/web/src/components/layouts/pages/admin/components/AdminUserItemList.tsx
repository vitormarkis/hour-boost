import { useUserAdminList } from "../hooks/useUserAdminList"
import { UserAdminItemListItem } from "./AdminUserItemListItem"

export type UserAdminItemListProps = {}

export function UserAdminItemList() {
  const { data: userIdList } = useUserAdminList({
    select: userList => userList.map(user => user.id_user),
  })

  return userIdList.map(userId => (
    <UserAdminItemListItem
      userId={userId}
      key={userId}
    />
  ))
}

UserAdminItemList.displayName = "UserAdminItemList"
