import { DataOrFail, IRefreshToken, SteamAccountClientStateCacheRepository } from "core"
import { Logger } from "~/utils/Logger"
import { Pretify, nice } from "~/utils/helpers"
import { nonNullable } from "~/utils/nonNullable"

export type RetrieveSessionListUseCasePayload = {
  whitelistAccountNames?: string[]
}

export type RefreshTokenWithAccountName = IRefreshToken & {
  accountName: string
}

interface IRetrieveSessionListUseCase {
  execute(...args: any[]): Promise<DataOrFail<any, RefreshTokenWithAccountName[]>>
}

export class RetrieveSessionListUseCase implements IRetrieveSessionListUseCase {
  logger = new Logger("retrieve-session-accounts")

  constructor(
    private readonly steamAccountClientStateCacheRepository: SteamAccountClientStateCacheRepository
  ) {}

  async execute({ whitelistAccountNames } = {} as RetrieveSessionListUseCasePayload) {
    const allLoggedUsersKeys = await this.steamAccountClientStateCacheRepository.getUsersRefreshToken()
    const loggedUsersKeys = whitelistAccountNames
      ? allLoggedUsersKeys.filter(k => {
          const [accountName] = k.split(":")
          return whitelistAccountNames.includes(accountName)
        })
      : allLoggedUsersKeys
    this.logger.log({
      allLoggedUsersKeys,
      loggedUsersKeys,
    })
    this.logger.log("got accounts keys ", loggedUsersKeys)
    const sessionsSchema = loggedUsersKeys.reduce((acc, key) => {
      const [accountName] = key.split(":")
      acc.push({
        accountName,
        key,
      })
      return acc
    }, [] as RestoreSessionSchema[])
    const sessionsPromises = sessionsSchema.map(
      async ({ accountName }): Promise<RefreshTokenWithAccountName | null> => {
        const foundRefreshToken =
          await this.steamAccountClientStateCacheRepository.getRefreshToken(accountName)
        if (!foundRefreshToken) return null

        return {
          accountName,
          ...foundRefreshToken,
        }
      }
    )
    const sessionsNull = await Promise.all(sessionsPromises)
    const sessions: RefreshTokenWithAccountName[] = sessionsNull.filter(nonNullable)
    this.logger.log(
      "got refresh tokens for each account ",
      sessions.map(s => s?.accountName)
    )

    return nice(sessions)
  }
}

interface RestoreSessionSchema {
  accountName: string
  key: string
}
