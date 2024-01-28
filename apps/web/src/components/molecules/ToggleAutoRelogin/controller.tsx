import { useMediaQuery } from "@/components/hooks"
import { useSteamAccountListItem } from "@/components/molecules/SteamAccountListItem/context"
import { useSteamAccountStore } from "@/components/molecules/SteamAccountListItem/store/useSteamAccountStore"
import { Switch } from "@/components/ui/switch"

export interface ToggleAutoReloginPayload {
  accountName: string
}

export const ToggleAutoRelogin = () => {
  const isLessDesktop = useMediaQuery("(max-width: 896px)")
  const autoRelogin = useSteamAccountStore(state => state.autoRelogin)
  const { handleToggleAutoRelogin, mutations } = useSteamAccountListItem()

  return (
    <Switch
      disabled={mutations.toggleAutoRelogin.isPending}
      checked={autoRelogin}
      onCheckedChange={handleToggleAutoRelogin}
      size="1.25rem"
    />
  )
}
