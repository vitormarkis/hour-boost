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
import { api } from "@/lib/axios"
import { cn } from "@/lib/utils"
import { useAuth } from "@clerk/clerk-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { API_GET_AccountGames, API_GET_RefreshAccountGames, GameSession, GameWithAccountName } from "core"
import React, { ComponentPropsWithoutRef, useState } from "react"

export const DrawerSheetChooseFarmingGames = ({
  accountName,
  accountNameList,
  ...props
}: ComponentPropsWithoutRef<typeof SheetContent> & {
  accountGames: GameSession[]
  accountNameList: string[]
  accountName: string
}) => {
  const { data, error, isLoading } = useQuery<GameWithAccountName[]>({
    queryKey: ["games", user.id_user],
    async queryFn() {
      const gamesPromises = user.steamAccounts.map(async sa => {
        const { data } = await api.get<API_GET_AccountGames>(`/games?accountName=${sa.accountName}`, {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        })

        return {
          accountName: sa.accountName,
          games: data.games,
        } satisfies GameWithAccountName
      })

      return Promise.all(gamesPromises)
    },
  })

  const { userId } = useAuth()

  return (
    <DrawerSheetChooseFarmingGamesView
      accountGames={accountGames}
      userId={userId!}
      accountName={accountName}
      accountNameList={accountNameList}
      {...props}
    >
      {props.children}
    </DrawerSheetChooseFarmingGamesView>
  )
}

export type DrawerSheetChooseFarmingGamesProps = React.ComponentPropsWithoutRef<"div"> & {
  children: React.ReactNode
  accountGames: GameSession[]
  userId: string
  accountName: string
  accountNameList: string[]
}

export const DrawerSheetChooseFarmingGamesView = React.forwardRef<
  React.ElementRef<"div">,
  DrawerSheetChooseFarmingGamesProps
>(function DrawerSheetChooseFarmingGamesComponent(
  { children, accountNameList, accountName, userId, accountGames, className, ...props },
  ref
) {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  const { mutate } = useMutation<GameWithAccountName[]>({
    mutationFn: async () => {
      const refreshGamesPromises = accountNameList.map(async accountName => {
        const { data } = await api.get<API_GET_RefreshAccountGames>(
          `/refresh-games?accountName=${accountName}`
        )
        return {
          accountName,
          games: data.games,
        } satisfies GameWithAccountName
      })

      return Promise.all(refreshGamesPromises)
    },
    onSuccess(accountGames) {
      console.log("refreshing account games", {
        gotRefreshAccountGames: accountGames,
        userId,
      })
      queryClient.setQueryData<GameWithAccountName[]>(["games", userId], accountGames)
    },
  })

  function handleRefreshGames() {
    mutate()
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
        <main>
          <div className="flex flex-col gap-2">
            {accountGames.map(game => (
              <div
                key={game.id}
                className="h-11 relative"
              >
                <img
                  src={game.imageUrl}
                  className="h-full w-full absolute inset-0 object-cover"
                />
              </div>
            ))}
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
