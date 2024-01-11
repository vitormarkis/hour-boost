import { SteamAccountListItemViewDesktop } from "./desktop"
import { SteamAccountListItemViewMobile } from "./mobile"
import { SteamAccountStatusProps, SteamAccountAppProps, SteamAccountStatusLiveProps } from "./types"

export function SteamAccountList({
  app,
  status,
}: {
  status: SteamAccountStatusProps
  app: SteamAccountAppProps
}) {
  return (
    <>
      <SteamAccountListItemViewDesktop
        app={app}
        {...status}
        status="offline"
        hoursFarmedInSeconds={0}
        farmingTime={0}
        className="mdx:flex hidden"
      />
      <SteamAccountListItemViewMobile
        app={app}
        {...status}
        status="offline"
        hoursFarmedInSeconds={0}
        farmingTime={0}
        className="mdx:hidden flex"
      />
    </>
  )
}
