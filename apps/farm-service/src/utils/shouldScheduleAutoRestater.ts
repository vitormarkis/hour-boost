import SteamUser from "steam-user"

export function thisErrorShouldScheduleAutoRestarter(eresult: SteamUser.EResult) {
  switch (eresult) {
    case SteamUser.EResult.LoggedInElsewhere:
    case SteamUser.EResult.NoConnection:
      return true
    default:
      return false
  }
}
