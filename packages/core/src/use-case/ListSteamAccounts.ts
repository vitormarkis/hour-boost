import { ISteamAccountSession } from "../io/common"
import { UsersDAO } from "../contracts/UsersDAO"

export class ListSteamAccounts {
  constructor(private readonly usersDAO: UsersDAO) {}

  async execute(input: ListSteamAccountsInput): Promise<ListSteamAccountsOutput> {
    const output = await this.usersDAO.getUsersSteamAccounts(input.userId)
    return {
      steamAccounts: output,
    }
  }
}

export type ListSteamAccountsInput = {
  userId: string
}

export type ListSteamAccountsOutput = {
  steamAccounts: ISteamAccountSession[]
}
