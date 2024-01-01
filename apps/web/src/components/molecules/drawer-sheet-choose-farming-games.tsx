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
import { useUser } from "@/contexts/UserContext"
import { api } from "@/lib/axios"
import { cn } from "@/lib/utils"
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

  const { mutate } = useMutation<API_GET_RefreshAccountGames, unknown, { accountName: string }>({
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
    mutate({ accountName })
  }

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        {...props}
        className={cn("p-0 flex flex-col", className)}
        ref={ref}
        side="right"
      >
        <SheetHeader>
          <SheetTitle>Are you sure absolutely sure?</SheetTitle>
          <SheetDescription>
            This action cannot be undone. This will permanently delete your account and remove your data from
            our servers.
          </SheetDescription>
          <Button onClick={handleRefreshGames}>Atualizar jogos</Button>
        </SheetHeader>
        <main className="flex-1">
          <pre>{JSON.stringify({ maxGamesAllowed: user.plan.maxGamesAllowed }, null, 2)}</pre>
          <div className="flex flex-col gap-2">
            {games ? (
              games.map(game => (
                <GameItem
                  key={game.id}
                  game={game}
                />
              ))
            ) : (
              <span>user games in nullish</span>
            )}
          </div>
        </main>
        <SheetFooter className="">
          <Button className="flex-1">Salvar</Button>
          <Button className="flex-1">Cancelar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
})

DrawerSheetChooseFarmingGames.displayName = "drawerSheetChooseFarmingGames"
