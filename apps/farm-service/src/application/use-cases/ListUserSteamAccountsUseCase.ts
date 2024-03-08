import type { DatabaseSteamAccount, ISteamAccountSession, SteamAccountPersonaState, UsersDAO } from "core"
import type { GetPersonaStateUseCase } from "~/application/use-cases/GetPersonaStateUseCase"

export class ListUserSteamAccountsUseCase {
  constructor(
    private readonly usersDAO: UsersDAO,
    private readonly getPersonaState: GetPersonaStateUseCase
  ) {}

  async execute({ userId }: ListSteamAccountsInput): Promise<ListSteamAccountsOutput> {
    const dbSteamAccounts = await this.usersDAO.getUsersSteamAccounts(userId)
    const sessionSteamAccountProps: Array<DatabaseSteamAccount & SteamAccountPersonaState> =
      await Promise.all(
        dbSteamAccounts.map(async ({ accountName, id_steamAccount }) => {
          const [error, persona] = await this.getPersonaState.execute({
            accountName,
            userId,
          })
          if (error) return Promise.reject(error)
          return Promise.resolve({
            accountName,
            id_steamAccount,
            profilePictureUrl: persona.profilePictureUrl,
            userId,
          })
        })
      )

    const steamAccounts: ISteamAccountSession[] = sessionSteamAccountProps.map(
      ({ accountName, id_steamAccount, userId, profilePictureUrl }) => ({
        accountName,
        id_steamAccount,
        userId,
        profilePictureUrl,
      })
    )
    return {
      steamAccounts,
    }
  }
}

export type ListSteamAccountsInput = {
  userId: string
}

export type ListSteamAccountsOutput = {
  steamAccounts: ISteamAccountSession[]
}
