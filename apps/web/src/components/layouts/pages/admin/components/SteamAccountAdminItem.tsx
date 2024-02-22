import React, { CSSProperties, PropsWithChildren, createContext, useContext, useEffect } from "react"
import { cn } from "@/lib/utils"
import { SteamAccountSession } from "core"
import { ImagesGrid, ImagesGridContent, ImagesGridIconWrapper } from "./ImagesGrid"
import { IMG_USER_PLACEHOLDER } from "@/consts"
import { useUserAdminListItem } from "../hooks/useUserAdminListItem"
import { useUserAdminItemId } from "../UserItemAction/context"
import { IconJoystick } from "@/components/icons/IconJoystick"
import { IconScrollText } from "@/components/icons/IconScrollText"
import { TimeSince } from "@/components/atoms/TimeSince"
import { SeeGamesSheet } from "./SeeGamesSheet"

export type SteamAccountAdminItemProps = React.ComponentPropsWithoutRef<"div"> & {}

const SteamAccountAdminItem = React.forwardRef<React.ElementRef<"div">, SteamAccountAdminItemProps>(
  function SteamAccountAdminItemComponent({ className, ...props }, ref) {
    const accountName = useSteamAccountAdminItem(sa => sa.accountName)
    const profilePictureUrl = useSteamAccountAdminItem(sa => sa.profilePictureUrl)
    const status = useSteamAccountAdminItem(sa => sa.status)
    const farmedTimeInSeconds = useSteamAccountAdminItem(sa => sa.farmedTimeInSeconds)
    const farmStartedAt = useSteamAccountAdminItem(sa => sa.farmStartedAt)

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
              <TimeSinceFarmStartedAt farmStartedAt={new Date(farmStartedAt)} />
            ) : (
              <div className="flex gap-1 leading-none font-medium whitespace-nowrap text-sm text-slate-600">
                <span>não</span>
              </div>
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
              <ImagesGridStagingGames />
            </div>
            <div className="h-full flex items-center justify-center w-[--sa-games-width]">
              <ImagesGridFarmingGames />
            </div>
          </div>
        </div>
      </div>
    )
  }
)

SteamAccountAdminItem.displayName = "SteamAccountAdminItem"

export type ImagesGridStagingGamesProps = React.ComponentPropsWithoutRef<"div"> & {}

export const ImagesGridStagingGames = React.memo(
  React.forwardRef<React.ElementRef<"div">, ImagesGridStagingGamesProps>(
    function ImagesGridStagingGamesComponent({ className, ...props }, ref) {
      const games = useSteamAccountAdminItem(sa => sa.games)
      const stagingGames = useSteamAccountAdminItem(sa => sa.stagingGames)
      const accountName = useSteamAccountAdminItem(sa => sa.accountName)

      const description: React.FC = () => (
        <p>
          Esses são os jogos que atualmente{" "}
          <strong className="font-semibold text-white">{accountName}</strong> possui em staging.
        </p>
      )

      return (
        <SeeGamesSheet
          description={description}
          title="Jogos em staging"
          choosedOnes={stagingGames}
          games={games}
        >
          <ImagesGrid
            {...props}
            className={cn("w-full", className)}
            ref={ref}
          >
            <ImagesGridIconWrapper>
              <IconScrollText className="size-4 text-slate-600 group-hover:text-white transition-all duration-150" />
            </ImagesGridIconWrapper>
            <ImagesGridContent
              source={games!.filter(game => stagingGames.includes(game.id)).map(g => g.imageUrl)}
            />
          </ImagesGrid>
        </SeeGamesSheet>
      )
    }
  )
)

ImagesGridStagingGames.displayName = "ImagesGridStagingGames"

export type ImagesGridFarmingGamesProps = Omit<
  React.ComponentPropsWithoutRef<typeof ImagesGrid>,
  "children"
> & {}

export const ImagesGridFarmingGames = React.memo(
  React.forwardRef<React.ElementRef<typeof ImagesGrid>, ImagesGridFarmingGamesProps>(
    function ImagesGridFarmingGamesComponent({ className, ...props }, ref) {
      const games = useSteamAccountAdminItem(sa => sa.games)
      const farmingGames = useSteamAccountAdminItem(sa => sa.farmingGames)
      const accountName = useSteamAccountAdminItem(sa => sa.accountName)

      const description: React.FC = () => (
        <p>
          Esses são os jogos que atualmente{" "}
          <strong className="font-semibold text-white">{accountName}</strong> está farmando.
        </p>
      )

      return (
        <SeeGamesSheet
          description={description}
          title="Jogos farmando"
          choosedOnes={farmingGames}
          games={games}
        >
          <ImagesGrid
            {...props}
            className={cn("w-full", className)}
            ref={ref}
          >
            <ImagesGridIconWrapper>
              <IconJoystick className="size-4 fill-slate-600 group-hover:fill-white transition-all duration-150" />
            </ImagesGridIconWrapper>
            <ImagesGridContent
              source={games!.filter(game => farmingGames.includes(game.id)).map(g => g.imageUrl)}
            />
          </ImagesGrid>
        </SeeGamesSheet>
      )
    }
  )
)

ImagesGridFarmingGames.displayName = "ImagesGridFarmingGames"

type TimeSinceFarmStartedAtProps = {
  farmStartedAt: Date | null
}

export function TimeSinceFarmStartedAt({ farmStartedAt }: TimeSinceFarmStartedAtProps) {
  if (!farmStartedAt) return <span>Sem informações do farm</span>

  return (
    <TimeSince.Root date={farmStartedAt}>
      <TimeSince.HighlightTime className="text-sm" />
    </TimeSince.Root>
  )
}

interface CSteamAccountAdminItemHooksContext {
  useSteamAccountAdminItem: <Selected>(
    select?: ((steamAccount: SteamAccountSession) => Selected) | undefined
  ) => Selected
}

export const SteamAccountAdminItemHooksContext = createContext({} as CSteamAccountAdminItemHooksContext)

/**
 * Hook
 */
export function useSteamAccountAdminItem<Selected>(
  selector: ((steamAccount: SteamAccountSession) => Selected) | undefined
) {
  const { useSteamAccountAdminItem } = useContext(SteamAccountAdminItemHooksContext)
  return useSteamAccountAdminItem<Selected>(selector)
}

/**
 * Provider
 */
type SteamAccountAdminItemHooksContextProviderProps = PropsWithChildren & {
  steamAccountId: string
}
function SteamAccountAdminItemHooksContextProvider({
  steamAccountId,
}: SteamAccountAdminItemHooksContextProviderProps) {
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

  return (
    <SteamAccountAdminItemHooksContext.Provider value={{ useSteamAccountAdminItem }}>
      <SteamAccountAdminItem />
    </SteamAccountAdminItemHooksContext.Provider>
  )
}

export { SteamAccountAdminItemHooksContextProvider as SteamAccountAdminItem }
