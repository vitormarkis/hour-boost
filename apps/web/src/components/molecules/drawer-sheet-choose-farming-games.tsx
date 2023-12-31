import React, { ComponentPropsWithoutRef, PropsWithChildren, useState } from "react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/clerk-react"
import { api } from "@/lib/axios"
import { API_GET_AccountGames } from "core"
import { AccountNameGames } from "@/components/layouts/DashboardSteamAccountsList"

export type DrawerSheetChooseFarmingGamesProps = React.ComponentPropsWithoutRef<"div"> & {
  children: React.ReactNode
  accountGames: AccountNameGames[]
}

export const DrawerSheetChooseFarmingGames = ({
  userId,
  ...props
}: ComponentPropsWithoutRef<typeof SheetContent> & {
  userId: string
}) => {
  const queryClient = useQueryClient()
  const accountGames = queryClient.getQueryData<AccountNameGames[]>(["games", userId]) ?? [
    {
      accountName: "not found",
      games: [
        {
          id: 10,
          imageUrl: "",
        },
      ],
    },
  ]

  return (
    <DrawerSheetChooseFarmingGamesView
      accountGames={accountGames}
      {...props}
    >
      {props.children}
    </DrawerSheetChooseFarmingGamesView>
  )
}

export const DrawerSheetChooseFarmingGamesView = React.forwardRef<
  React.ElementRef<"div">,
  DrawerSheetChooseFarmingGamesProps
>(function DrawerSheetChooseFarmingGamesComponent({ children, className, ...props }, ref) {
  const [open, setOpen] = useState(false)

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
        </SheetHeader>
        <main className="flex-1">{}</main>
        <SheetFooter className="">
          <Button className="flex-1">Salvar</Button>
          <Button className="flex-1">Cancelar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
})

DrawerSheetChooseFarmingGames.displayName = "drawerSheetChooseFarmingGames"
