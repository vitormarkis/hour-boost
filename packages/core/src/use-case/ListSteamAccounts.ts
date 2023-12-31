import { ISteamAccountSession } from "../io/common"

export type ListSteamAccountsInput = {
  userId: string
}

export type ListSteamAccountsOutput = {
  steamAccounts: ISteamAccountSession[]
}
