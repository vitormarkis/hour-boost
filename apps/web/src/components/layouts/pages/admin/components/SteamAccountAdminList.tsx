import React from "react"
import { useUserAdminItemId } from "../UserItemAction/context"
import { useUserAdminListItem } from "../hooks/useUserAdminListItem"
import { SteamAccountAdminItem } from "./SteamAccountAdminItem"

type SteamAccountAdminListProps = {}

function SteamAccountAdminList({}: SteamAccountAdminListProps) {
  const userId = useUserAdminItemId()
  const steamAccountsIdList = useUserAdminListItem(userId, user =>
    user.steamAccounts.map(sa => sa.id_steamAccount)
  )

  return steamAccountsIdList.map(id => (
    <SteamAccountAdminItem
      key={id}
      steamAccountId={id}
    />
  ))
}

const memoSteamAccountAdminList = React.memo(SteamAccountAdminList)

export { memoSteamAccountAdminList as SteamAccountAdminList }
