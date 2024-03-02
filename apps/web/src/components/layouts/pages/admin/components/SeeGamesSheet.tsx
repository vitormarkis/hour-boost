import { GameItem } from "@/components/molecules/GameItem"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { GameSession } from "core"
import React, { useState } from "react"

export type SeeGamesSheetProps = React.ComponentPropsWithoutRef<typeof SheetContent> & {
  games: GameSession[] | null
  choosedOnes: number[]
  title: string
  description: React.FC
}

export const SeeGamesSheet = React.forwardRef<React.ElementRef<typeof SheetContent>, SeeGamesSheetProps>(
  function SeeGamesSheetComponent(
    { description: Description, title, choosedOnes, games: gamesRaw, children, className, ...props },
    ref
  ) {
    const [isOpen, setIsOpen] = useState(false)

    const games = gamesRaw ? [...gamesRaw].sort(game => (choosedOnes.includes(game.id) ? -1 : 1)) : null

    return (
      <Sheet
        open={isOpen}
        onOpenChange={isOpening => setIsOpen(games ? isOpening : false)}
      >
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent
          {...props}
          className={cn("border-none bg-transparent p-0", className)}
          ref={ref}
          side="right"
        >
          <div className="flex h-screen flex-col p-0">
            <div className="bg-background absolute inset-0 bottom-[4.5rem] overflow-hidden rounded-b-md border-b border-l border-slate-800">
              <SheetHeader className="px-4 pt-6">
                <SheetTitle>{title}</SheetTitle>
                <SheetDescription>
                  <Description />
                </SheetDescription>
              </SheetHeader>
              <main className="mt-4 h-[calc(100%_-_8rem)] flex-1 overflow-y-scroll pb-14">
                <div className="flex flex-col gap-2 overflow-y-hidden">
                  {games ? (
                    games.map(game => (
                      <GameItem
                        key={game.id}
                        game={game}
                        handleFarmGame={() => {}}
                        isSelected={choosedOnes.includes(game.id)}
                      />
                    ))
                  ) : (
                    <span className="px-4 pt-6 text-slate-600">Nenhum jogo encontrado.</span>
                  )}
                </div>
              </main>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }
)

SeeGamesSheet.displayName = "SeeGamesSheet"
