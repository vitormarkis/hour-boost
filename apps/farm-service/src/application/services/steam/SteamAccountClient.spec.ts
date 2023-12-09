import SteamUser from "steam-user"
import { EventEmitter } from "~/application/services"
import { SteamAccountClient } from "~/application/services/steam"
import { Publisher } from "~/infra/queue"
import { SteamUserMock } from "~/infra/services/SteamUserMock"

describe("UserSteamClient test suite", () => {
  test("should ", async () => {
    const sacEmitter = new EventEmitter()
    const sac = new SteamAccountClient({
      instances: {
        publisher: new Publisher(),
        emitter: sacEmitter,
      },
      props: {
        client: new SteamUserMock([]) as unknown as SteamUser,
        userId: "",
        username: "vitor",
        accountName: "account",
      },
    })
    sac.farmGames([322, 123])
    expect(sac.getGamesPlaying()).toStrictEqual([322, 123])
  })
})