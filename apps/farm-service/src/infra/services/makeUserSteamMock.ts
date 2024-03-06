import { SteamAccountCredentials } from "core"
import SteamUser from "steam-user"
import { env } from "~/env"
import { SteamUserMock } from "~/infra/services"

export const makeUserSteamMock = () => {
  if (env.EXAMPLE_ACCOUNT_NAME && env.EXAMPLE_ACCOUNT_PASSWORD) {
    const credentials = {
      accountName: env.EXAMPLE_ACCOUNT_NAME,
      password: env.EXAMPLE_ACCOUNT_PASSWORD,
    } as const
    return new SteamUserMock([SteamAccountCredentials.create(credentials)]) as unknown as SteamUser
  }

  throw new Error("You need to provide at least one account credentials.")
}
