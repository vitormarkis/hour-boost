import { AllUsersClientsStorage, UserClientsStorage } from "~/application/services"
import { bad, nice } from "./helpers"
import { Fail } from "core"

export function getSACOn_AllUsersClientsStorage_ByUserId(
  userId: string,
  allUsersClientsStorage: AllUsersClientsStorage
) {
  return (accountName: string) => {
    const userClientsStorage = allUsersClientsStorage.get(userId)
    if (!userClientsStorage) return bad(Fail.create("USER-CLIENTS-STORAGE-NOT-FOUND", 404))
    return nice(getSACOnAllUsersClientsStorage(accountName, userClientsStorage))
  }
}
export function getSACOnAllUsersClientsStorage(accountName: string, userClientsStorage: UserClientsStorage) {
  return userClientsStorage.getAccountClient(accountName)
}
