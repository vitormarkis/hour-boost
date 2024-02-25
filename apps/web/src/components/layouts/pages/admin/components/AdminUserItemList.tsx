import { Accordion } from "@/components/ui/accordion"
import { useEffect, useState } from "react"
import { useUserAdminList } from "../hooks/useUserAdminList"
import { UserAdminItemListItem } from "./AdminUserItemListItem"

type PendingProps = {
  isPending: boolean
}

function UserAdminItemListComponent({ isPending }: PendingProps) {
  const { data: usersInfo } = useUserAdminList({
    select: userList => userList.map(user => `${user.id_user}::${user.steamAccounts.length}`),
  })
  const { data: userIdListHasAccounts } = useUserAdminList({
    select: userList => userList.filter(user => user.steamAccounts.length).map(user => user.id_user),
  })
  const usersInfoTuples = usersInfo.map(user => {
    const [userId, accountsAmount] = user.split("::")
    return { userId, accountsAmount: parseInt(accountsAmount) }
  })

  const shownUserIdList = [...usersInfoTuples]
    .sort((a, b) => b.accountsAmount - a.accountsAmount)
    .map(info => info.userId)

  return (
    <Accordion
      type="multiple"
      defaultValue={userIdListHasAccounts}
      className={isPending ? "opacity-50" : "opacity-100"}
    >
      {shownUserIdList.map(userId => (
        <UserAdminItemListItem
          userId={userId}
          key={userId}
        />
      ))}
    </Accordion>
  )
}

UserAdminItemListComponent.displayName = "UserAdminItemListComponent"

export function UserAdminItemList({ isPending }: PendingProps) {
  const [hasDocument, setHasDocument] = useState(false)

  useEffect(() => {
    setHasDocument(true)
  }, [])

  if (!hasDocument) {
    return <h3>Loading...</h3>
  }

  return <UserAdminItemListComponent isPending={isPending} />
}
