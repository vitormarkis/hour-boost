import React, { CSSProperties } from "react"
import { cn } from "@/lib/utils"
import { SteamAccountSession } from "core"
import { ImagesGrid, ImagesGridContent, ImagesGridIconWrapper } from "./ImagesGrid"
import { IMG_USER_PLACEHOLDER } from "@/consts"
import { useUserAdminListItem } from "../hooks/useUserAdminListItem"
import { useUserAdminItemId } from "../UserItemAction/context"
import { IconJoystick } from "@/components/icons/IconJoystick"
import { IconScrollText } from "@/components/icons/IconScrollText"
import { TimeSince } from "@/components/atoms/TimeSince"

export type SteamAccountAdminItemProps = React.ComponentPropsWithoutRef<"div"> & {
  steamAccountId: string
}

export const SteamAccountAdminItem = React.forwardRef<React.ElementRef<"div">, SteamAccountAdminItemProps>(
  function SteamAccountAdminItemComponent({ steamAccountId, className, ...props }, ref) {
    const userId = useUserAdminItemId()

    const useSteamAccountAdminItem = React.useCallback(
      function <Selected>(select?: (steamAccount: SteamAccountSession) => Selected) {
        return useUserAdminListItem<Selected>(userId, userList => {
          const foundSteamAccount = userList.steamAccounts.find(u => u.id_steamAccount === steamAccountId)!
          return select ? select(foundSteamAccount) : (foundSteamAccount as Selected)
        })
      },
      [userId]
    )

    const { accountName, profilePictureUrl, farmingGames, games, stagingGames } = useSteamAccountAdminItem(
      sa => ({
        profilePictureUrl: sa.profilePictureUrl,
        accountName: sa.accountName,
        games: sa.games,
        farmingGames: sa.farmingGames,
        stagingGames: sa.stagingGames,
      })
    )

    const status = useSteamAccountAdminItem(sa => sa.status)
    const farmStartedAt = useSteamAccountAdminItem(sa => sa.farmStartedAt)
    const farmedTimeInSeconds = useSteamAccountAdminItem(sa => sa.farmedTimeInSeconds)

    return (
      <div
        {...props}
        className={cn("pl-[--sa-padding-left]", className)}
        ref={ref}
      >
        <div className="select-none h-[--container-height] flex items-center bg-black/10 hover:bg-slate-900/50 cursor-pointer">
          <div className="pr-2">
            <div className="h-[--container-height] w-[--container-height] grid place-items-center">
              <div className="h-11 w-11 grid place-items-center">
                <div className="h-10 w-10 relative shadow-lg shadow-black/50 rounded overflow-hidden">
                  <img
                    src={profilePictureUrl ?? IMG_USER_PLACEHOLDER}
                    // alt={`${user.username}'s profile picture.`}
                    className="h-full w-full absolute inset-0"
                  />
                  <div className="inset-0 bg-black" />
                </div>
              </div>
            </div>
          </div>
          <div className="h-full flex justify-center flex-col w-[--sa-name-width]">
            <span className="text-sm text-slate-300">{accountName}</span>
            <div className="flex items-center">
              <div
                className={cn(
                  "size-1 rounded-full bg-slate-500 translate-y-0.5",
                  status === "online" && "bg-green-500"
                )}
              />
              <span className="text-xs pl-1 text-slate-500">{status}</span>
            </div>
          </div>
          <div className="h-full flex items-center justify-center w-[--sa-farm-since-width]">
            {farmStartedAt ? (
              <TimeSince.Root date={farmStartedAt}>
                <TimeSince.HighlightTime className="text-sm" />
              </TimeSince.Root>
            ) : (
              <span>Sem informações do farm</span>
            )}
          </div>
          <div className="h-full flex items-center justify-center w-[--sa-farmed-time-width]">
            <div className="flex relative tabular-nums">
              <div className="flex gap-1 leading-none font-medium whitespace-nowrap text-sm">
                {(farmedTimeInSeconds / 60 / 60).toFixed(2)}
                <span className="text-slate-600">horas</span>
              </div>
            </div>
          </div>
          <div className="ml-auto flex">
            <div className="h-full flex items-center justify-center w-[--sa-games-width]">
              <ImagesGrid className="w-full">
                <ImagesGridIconWrapper>
                  <IconScrollText className="size-4 text-slate-600 group-hover:text-white transition-all duration-150" />
                </ImagesGridIconWrapper>
                <ImagesGridContent
                  source={games!.filter(game => stagingGames.includes(game.id)).map(g => g.imageUrl)}
                />
              </ImagesGrid>
            </div>
            <div className="h-full flex items-center justify-center w-[--sa-games-width]">
              <ImagesGrid className="w-full">
                <ImagesGridIconWrapper>
                  <IconJoystick className="size-4 fill-slate-600 group-hover:fill-white transition-all duration-150" />
                </ImagesGridIconWrapper>
                <ImagesGridContent
                  source={games!.filter(game => farmingGames.includes(game.id)).map(g => g.imageUrl)}
                />
              </ImagesGrid>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

SteamAccountAdminItem.displayName = "SteamAccountAdminItem"
