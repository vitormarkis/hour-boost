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
import { cn } from "@/lib/utils"
import { AccountSteamGameDTO } from "core"
import React, { ComponentPropsWithoutRef, useState } from "react"

export type DrawerSheetChooseFarmingGamesProps = React.ComponentPropsWithoutRef<"div"> & {
  children: React.ReactNode
  accountGames: AccountSteamGameDTO[]
}

export const DrawerSheetChooseFarmingGames = ({
  accountGames,
  ...props
}: ComponentPropsWithoutRef<typeof SheetContent> & {
  accountGames: AccountSteamGameDTO[]
}) => {
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
>(function DrawerSheetChooseFarmingGamesComponent({ children, accountGames, className, ...props }, ref) {
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
