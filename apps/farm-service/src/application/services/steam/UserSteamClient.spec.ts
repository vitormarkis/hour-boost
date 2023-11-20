import { SteamAccount } from "core"
import SteamUser from "steam-user"
import { UserSteamClient } from "~/application/services/steam/UserSteamClient"
import { Publisher } from "~/infra/queue"
import { SteamUserMock } from "~/infra/services/SteamUserMock"

describe("UserSteamClient test suite", () => {
  test("should ", async () => {
    const usc = new UserSteamClient({
      instances: {
        publisher: new Publisher(),
      },
      props: {
        client: new SteamUserMock([]) as unknown as SteamUser,
        userId: "",
        username: "vitor",
      },
    })
    usc.farmGames([322, 123])
    expect(usc.getGamesPlaying()).toStrictEqual([322, 123])
  })
})
