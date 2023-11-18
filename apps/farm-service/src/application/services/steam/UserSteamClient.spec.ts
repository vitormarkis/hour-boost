import { SteamAccount } from "core"
import SteamUser from "steam-user"
import { UserSteamClient } from "~/application/services/steam/UserSteamClient"
import { Publisher } from "~/infra/queue"

describe("UserSteamClient test suite", () => {
  test("should ", async () => {
    const usc = new UserSteamClient({
      instances: {
        publisher: new Publisher(),
      },
      props: {
        client: {} as SteamUser,
        userId: "",
        username: "vitor",
      },
    })
    usc.gamesPlaying = [123, 322]
    usc.farmGames([322, 123])
  })
})
