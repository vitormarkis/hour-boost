import { SteamGame } from "./SteamGame"
import { SteamAccount } from "./SteamAccount"
import { SteamAccountCredentials } from "./SteamAccountCredentials"

describe("SteamAccount test suite", () => {
  test("should add a game to steam account", async () => {
    const steamAccount = SteamAccount.create({
      credentials: SteamAccountCredentials.create({
        accountName: "vitoruser",
        password: "829382h394h234ijsdj982",
      }),
    })
    expect(steamAccount.games).toHaveLength(0)
    steamAccount.addGame(
      SteamGame.create({
        gameId: "405",
      })
    )
    expect(steamAccount.games).toHaveLength(1)
    expect(steamAccount.games[0].gameId).toBe("405")
  })

  test("should remove a game to steam account", async () => {
    const steamAccount = SteamAccount.restore({
      games: [SteamGame.create({ gameId: "405" })],
      id_steamAccount: "randomUUID",
      credentials: SteamAccountCredentials.create({
        accountName: "vitoruser",
        password: "829382h394h234ijsdj982",
      }),
    })
    expect(steamAccount.games).toHaveLength(1)
    steamAccount.removeGameByID("405")
    expect(steamAccount.games).toHaveLength(0)
  })
})
