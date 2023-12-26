import { AccountGames, AccountSteamGame, AccountSteamGamesList } from "core"

export const EVENT_PROMISES_TIMEOUT_IN_SECONDS = 30

export const IMG_URL_STEAM_GAME_HEADER = "https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg?t=730"

export const allAccountGames: Record<string, AccountGames> = {
  paco: {
    app_count: 2,
    apps: [
      { appid: 730, img_icon_url: "" },
      { appid: 489520, img_icon_url: "" },
    ],
  },
  fred: {
    app_count: 0,
    apps: [],
  },
  bane: {
    app_count: 1,
    apps: [{ appid: 601510, img_icon_url: "" }],
  },
}
