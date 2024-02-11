import { SteamAccountSession } from "core"
import { useUserAdminItemId } from "../UserItemAction/context"
import { useUserAdminListItem } from "./useUserAdminListItem"

// export function useSteamAccountAdminItem<Selected = SteamAccountSession>(
//   steamAccountId: string,
//   select?: (steamAccount: SteamAccountSession) => Selected
// ) {
//   return useUserAdminListItem<Selected>(userId, userList => {
//     const foundSteamAccount = userList.steamAccounts.find(u => u.id_steamAccount === steamAccountId)!
//     return select ? select(foundSteamAccount) : (foundSteamAccount as Selected)
//   })
// }
