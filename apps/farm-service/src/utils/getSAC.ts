import { Fail } from "core"
import type { AllUsersClientsStorage, UserClientsStorage } from "~/application/services"
import { EAppResults } from "~/application/use-cases"
import { bad, nice } from "./helpers"

export function getSACOn_AllUsersClientsStorage_ByUserId(
  userId: string,
  allUsersClientsStorage: AllUsersClientsStorage
) {
  return (accountName: string) => {
    const userClientsStorage = allUsersClientsStorage.get(userId)
    if (!userClientsStorage) {
      return bad(
        Fail.create("USER-CLIENTS-STORAGE-NOT-FOUND", 404, {
          givenUserId: userId,
          allUsers: allUsersClientsStorage.listUsersKeys(),
        })
      )
    }
    return getSACOnAllUsersClientsStorage(accountName, userClientsStorage)
  }
}
export function getSACOnAllUsersClientsStorage(accountName: string, userClientsStorage: UserClientsStorage) {
  const foundSAC = userClientsStorage.getAccountClient(accountName)
  return foundSAC ? nice(foundSAC) : bad(Fail.create(EAppResults["SAC-NOT-FOUND"], 404))
}
