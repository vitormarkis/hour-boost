import { AllUsersClientsStorage, UserClientsStorage } from "~/application/services"
import { bad, nice } from "./helpers"
import { EAppResults } from "~/application/use-cases"
import { User } from "core"

export function getUserSACs_OnStorage_ByUser(user: User, allUsersClientsStorage: AllUsersClientsStorage) {
  const userClientStorage = allUsersClientsStorage.get(user.id_user)
  if (!userClientStorage) return bad({ code: EAppResults["USER-STORAGE-NOT-FOUND"], userClientStorage })
  return nice(
    getUserSACs_OnStorage(
      user.steamAccounts.data.map(sa => sa.credentials.accountName),
      userClientStorage
    )
  )
}

export function getUserSACs_OnStorage_ByUserId(
  userId: string,
  allUsersClientsStorage: AllUsersClientsStorage
) {
  const userClientStorage = allUsersClientsStorage.get(userId)
  if (!userClientStorage) return bad({ code: EAppResults["USER-STORAGE-NOT-FOUND"], userClientStorage })
  return (accountNameList: string[]) => getUserSACs_OnStorage(accountNameList, userClientStorage)
}

export function getUserSACs_OnStorage(accountNameList: string[], userClientStorage: UserClientsStorage) {
  return accountNameList.map(accountName => {
    return userClientStorage.getAccountClient(accountName)
  })
}
