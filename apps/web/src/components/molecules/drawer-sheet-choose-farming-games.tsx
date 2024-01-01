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
import { IUserMethods, NSUserContext, useUser } from "@/contexts/UserContext"
import { api } from "@/lib/axios"
import { cn } from "@/lib/utils"
import { AppError, DataOrError } from "@/util/AppError"
import { useAuth } from "@clerk/clerk-react"
import { useMutation } from "@tanstack/react-query"
import { API_GET_RefreshAccountGames } from "core"
import React, { useContext, useState } from "react"

export type DrawerSheetChooseFarmingGamesProps = React.ComponentPropsWithoutRef<"div"> & {
  children: React.ReactNode
}

export const DrawerSheetChooseFarmingGames = React.forwardRef<
  React.ElementRef<"div">,
  DrawerSheetChooseFarmingGamesProps
>(function DrawerSheetChooseFarmingGamesComponent({ children, className, ...props }, ref) {
  const [open, setOpen] = useState(false)
  const { accountName, games } = useContext(SteamAccountListItemContext)
  const { getToken } = useAuth()
  const user = useUser()

  const initialStageFarmingGames = user.steamAccounts.find(sa => sa.accountName === accountName)
    ?.farmingGames!
  const [stageFarmingGames, setStageFarmingGames] = useState<number[]>(initialStageFarmingGames)

  function toggleFarmGame(gameId: number, onError: (error: AppError) => void) {
    console.log("1. toggling")
    setStageFarmingGames(stageFarmingGames => {
      const isAdding = !stageFarmingGames.includes(gameId)
      if (isAdding) {
        console.log("2. isAdding")
        if (stageFarmingGames.length >= user.plan.maxGamesAllowed) {
          console.log("3. no new games")
          onError(new AppError(`Você só pode farmar ${user.plan.maxGamesAllowed} por vez.`))
          return stageFarmingGames
        }
        return [...stageFarmingGames, gameId]
      }
      console.log("2. removing")
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

  const updateFarm = useMutation<
    IUserMethods.DataOrError,
    unknown,
    { accountName: string; gamesID: number[]; userId: string }
  >({
    async mutationFn({ accountName, gamesID, userId }) {
      const response = await api.post(
        "/farm/start",
        {
          accountName,
          gamesID,
          userId,
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

  async function handleUpdateFarmingGames() {
    try {
      console.log("[user context] start set farming games...")
      await updateFarm.mutateAsync({ accountName, gamesID: stageFarmingGames, userId: user.id })
      console.log("[user context] farmed games")
      user.updateFarmingGames({
        accountName,
        gameIdList: stageFarmingGames,
      })
      setOpen(false)
    } catch (error) {
      alert(error.message)
    }
  }

  function handleStopFarm() {
    setStageFarmingGames([])
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
          <pre>{JSON.stringify({ stageFarmingGames }, null, 2)}</pre>
          <div className="flex flex-col gap-2">
            {games ? (
              games.map(game => (
                <GameItem
                  key={game.id}
                  game={game}
                  handleFarmGame={() => toggleFarmGame(game.id, alert)}
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
            onClick={handleUpdateFarmingGames}
            disabled={updateFarm.isPending}
          >
            <span>{updateFarm.isPending ? "Salvando" : "Salvar"}</span>
            {updateFarm.isPending && (
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

DrawerSheetChooseFarmingGames.displayName = "DrawerSheetChooseFarmingGames"
