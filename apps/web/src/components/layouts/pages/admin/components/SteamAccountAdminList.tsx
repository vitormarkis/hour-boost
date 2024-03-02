import React from "react"
import { useUserAdminItemId } from "../UserItemAction/context"
import { useUserAdminListItem } from "../hooks/useUserAdminListItem"
import { SteamAccountAdminItem } from "./SteamAccountAdminItem"
import { SteamAccountAdminListHeader } from "./SteamAccountAdminListHeader"
import { SteamAccountAdminNoSteamAccounts } from "./SteamAccountAdminNoSteamAccounts"

type SteamAccountAdminListProps = {}

function SteamAccountAdminList({}: SteamAccountAdminListProps) {
  const userId = useUserAdminItemId()
  const steamAccountsIdList = useUserAdminListItem(userId, user =>
    user.steamAccounts.map(sa => sa.id_steamAccount)
  )

  if (steamAccountsIdList.length === 0) {
    return <SteamAccountAdminNoSteamAccounts />
  }
  const isUserBanned = useUserAdminListItem(userId, user => user.status) === "BANNED"

  return (
    <>
      {isUserBanned && <div className="absolute inset-0 z-50 cursor-not-allowed bg-black/10" />}
      <SteamAccountAdminListHeader />
      {steamAccountsIdList.map(id => (
        <SteamAccountAdminItem
          key={id}
          steamAccountId={id}
        />
      ))}
    </>
  )
}

const memoSteamAccountAdminList = React.memo(SteamAccountAdminList)

export { memoSteamAccountAdminList as SteamAccountAdminList }
