import SteamUser from "steam-user"
import { SteamBuilder } from "~/contracts"
import { SteamAccountCredentials, SteamUserMock } from "~/infra/services"

export function makeSteamBuilder(validSteamAccounts: SteamAccountCredentials[]): SteamBuilder {
  const steamBuilder: SteamBuilder = {
    create: () => new SteamUserMock(validSteamAccounts) as unknown as SteamUser,
  }

  return steamBuilder
}
