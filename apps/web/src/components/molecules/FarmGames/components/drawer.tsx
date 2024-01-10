import { IconArrowClockwise } from "@/components/icons/IconArrowClockwise"
import { GameItem } from "@/components/molecules/GameItem"
import { SteamAccountListItemContext } from "@/components/molecules/SteamAccountListItem"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { IUserMethods, useUser } from "@/contexts/UserContext"
import { api } from "@/lib/axios"
import { cn } from "@/lib/utils"
import { AppError } from "@/util/AppError"
import { DataOrMessage } from "@/util/DataOrMessage"
import { useAuth } from "@clerk/clerk-react"
import { UseMutationResult, useMutation } from "@tanstack/react-query"
import { API_GET_RefreshAccountGames } from "core"
import React, { useContext, useState } from "react"
import { toast } from "sonner"
import { FarmGamesPayload } from "../controller"
import { IntentionCodes } from "../view"

export type DrawerSheetChooseFarmingGamesViewProps = React.ComponentPropsWithoutRef<"div"> & {
  farmGames: UseMutationResult<DataOrMessage<string, IntentionCodes>, Error, FarmGamesPayload, unknown>
  children: React.ReactNode
}

export const DrawerSheetChooseFarmingGamesView = React.forwardRef<
  React.ElementRef<"div">,
  DrawerSheetChooseFarmingGamesViewProps
>(function DrawerSheetChooseFarmingGamesViewComponent({ children, farmGames, className, ...props }, ref) {
  const [open, setOpen] = useState(false)
  const { accountName, games } = useContext(SteamAccountListItemContext).app
  const { getToken } = useAuth()
  const user = useUser()

  const initialStageFarmingGames = user.steamAccounts.find(sa => sa.accountName === accountName)
    ?.farmingGames!
  const [stageFarmingGames, setStageFarmingGames] = useState<number[]>(initialStageFarmingGames)

  function toggleFarmGame(gameId: number, onError: (error: AppError) => void) {
    setStageFarmingGames(stageFarmingGames => {
      const isAdding = !stageFarmingGames.includes(gameId)
      if (isAdding) {
        if (stageFarmingGames.length >= user.plan.maxGamesAllowed) {
          onError(
            new AppError(
              `Seu plano permite apenas o farm de ${user.plan.maxGamesAllowed} jogos ao mesmo tempo.`
            )
          )
          return stageFarmingGames
        }
        return [...stageFarmingGames, gameId]
      }
      return stageFarmingGames.filter(gid => gid !== gameId)
    })
  }

  const refreshGames = useMutation<API_GET_RefreshAccountGames, unknown, { accountName: string }>({
    async mutationFn({ accountName }) {
      const response = await api.get<API_GET_RefreshAccountGames>(
        `/refresh-games?accountName=${accountName}`,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      )
      return response.data
    },
    onSuccess({ games }, { accountName }) {
      console.log("[user context] got new games, updating user games")
      user.setGames(accountName, games)
    },
    onMutate() {
      console.log("[user context] refreshing the games...")
    },
  })

  function handleRefreshGames() {
    refreshGames.mutate({ accountName })
  }

  const stopFarm = useMutation<IUserMethods.DataOrError, unknown, { accountName: string }>({
    async mutationFn({ accountName }) {
      const response = await api.post(
        "/farm/stop",
        {
          accountName,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      )
      return response.data
    },
  })

  async function handleFarmGames() {
    if (!games) return
    try {
      console.log("[user context] start set farming games...")
      const isStoppingTheFarm = stageFarmingGames.length === 0
      if (isStoppingTheFarm) {
        await stopFarm.mutateAsync({ accountName })
        console.log("[user context] stop the farm")
      } else {
        await farmGames.mutateAsync({ accountName, gamesID: stageFarmingGames, userId: user.id })
        const gamesNames: string[] = stageFarmingGames.map(gameId => games.find(g => g.id === gameId)!.name)
        toast.success(`Farmando os jogos ${gamesNames.join(", ")}.`)
        console.log("[user context] farmed games")
      }
      user.updateFarmingGames({
        accountName,
        gameIdList: stageFarmingGames,
      })
      setOpen(false)
    } catch (error) {
      toast(error.message)
    }
  }

  function handleStopFarm() {
    setStageFarmingGames([])
  }

  function handleFarmGame(gameId: number) {
    toggleFarmGame(gameId, error => {
      toast.info(error.message)
    })
  }

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        {...props}
        className={cn("p-0 flex flex-col border-slate-800", className)}
        ref={ref}
        side="right"
      >
        <SheetHeader className="py-6 px-4">
          <SheetTitle>{accountName} - Seus jogos</SheetTitle>
          <SheetDescription>Selecione os jogos que queira farmar e clique em salvar.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            onClick={handleStopFarm}
            className="flex-1 "
          >
            <span>Limpar farm</span>
          </Button>
          <Button
            onClick={handleRefreshGames}
            disabled={refreshGames.isPending}
            className="flex-1  relative"
          >
            <span>{refreshGames.isPending ? "Atualizando" : "Atualizar"}</span>
            {refreshGames.isPending && (
              <div className="absolute top-1/2 -translate-y-1/2 right-4">
                <IconArrowClockwise className="w-4 h-4 animate-spin" />
              </div>
            )}
          </Button>
        </div>
        <main className="flex-1">
          <div className="flex flex-col gap-2">
            {games ? (
              games.map(game => (
                <GameItem
                  key={game.id}
                  game={game}
                  handleFarmGame={() => handleFarmGame(game.id)}
                  isSelected={stageFarmingGames.includes(game.id)}
                />
              ))
            ) : (
              <span>user games in nullish</span>
            )}
          </div>
        </main>
        <SheetFooter className="">
          <Button
            className="flex-1 relative disabled:opacity-70"
            onClick={handleFarmGames}
            disabled={farmGames.isPending || stopFarm.isPending}
          >
            <span>{farmGames.isPending || stopFarm.isPending ? "Salvando" : "Salvar"}</span>
            {(farmGames.isPending || stopFarm.isPending) && (
              <div className="absolute top-1/2 -translate-y-1/2 right-4">
                <IconArrowClockwise className="w-4 h-4 animate-spin" />
              </div>
            )}
          </Button>
          <Button
            className="flex-1"
            variant="destructive"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
})

DrawerSheetChooseFarmingGamesView.displayName = "DrawerSheetChooseFarmingGamesView"
