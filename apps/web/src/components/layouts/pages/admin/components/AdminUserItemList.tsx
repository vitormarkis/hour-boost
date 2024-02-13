import { Accordion } from "@/components/ui/accordion"
import { useUserAdminList } from "../hooks/useUserAdminList"
import { UserAdminItemListItem } from "./AdminUserItemListItem"

export type UserAdminItemListProps = {}

export function UserAdminItemList() {
  const { data: userIdList } = useUserAdminList({
    select: userList => userList.map(user => user.id_user),
  })
  const { data: userIdListHasAccounts } = useUserAdminList({
    select: userList => userList.filter(user => user.steamAccounts.length).map(user => user.id_user),
  })

  return (
    <Accordion
      type="multiple"
      defaultValue={userIdListHasAccounts}
    >
      {userIdList.map(userId => (
        <UserAdminItemListItem
          userId={userId}
          key={userId}
        />
      ))}
    </Accordion>
  )
}

UserAdminItemList.displayName = "UserAdminItemList"
