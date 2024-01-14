import { useMemo, useState } from "react"
import { SteamAccountListItemViewDesktop } from "./desktop"
import { SteamAccountListItemViewMobile } from "./mobile"
import { SteamAccountAppProps, SteamAccountStatusProps } from "./types"
import { ISteamAccountListItemContext } from "./context"
import { useMediaQuery } from "@/components/hooks"

export function SteamAccountList({
  app,
  status,
}: {
  status: SteamAccountStatusProps
  app: SteamAccountAppProps
}) {
  const isLessDesktop = useMediaQuery("(max-width: 896px)")
  const [modalSelectGamesOpen, setModalSelectGamesOpen] = useState(false)

  function closeModal() {
    setModalSelectGamesOpen(false)
  }

  function openModal() {
    setModalSelectGamesOpen(true)
  }

  const props: ISteamAccountListItemContext = useMemo(
    () => ({
      ...status,
      app,
      status: "offline",
      hoursFarmedInSeconds: 0,
      farmingTime: 0,
      modalSelectGames: {
        closeModal,
        openModal,
        state: [modalSelectGamesOpen, setModalSelectGamesOpen],
      },
    }),
    [modalSelectGamesOpen, app, status]
  )

  if (isLessDesktop) {
    return <SteamAccountListItemViewMobile {...props} />
  }

  return <SteamAccountListItemViewDesktop {...props} />
}
