import type { SteamAccountCredentials } from "core"
import type SteamUser from "steam-user"
import type { SteamBuilder } from "~/contracts"
import { SteamUserMock } from "~/infra/services"

export class SteamUserMockBuilder implements SteamBuilder {
  constructor(
    private readonly validSteamAccounts: SteamAccountCredentials[],
    private readonly mobile?: boolean
  ) {}
  create(): SteamUser {
    console.log("building user client with MOBILE: ", this.mobile)
    return new SteamUserMock(this.validSteamAccounts, this.mobile) as unknown as SteamUser
  }
}
