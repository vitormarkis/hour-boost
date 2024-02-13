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

    const games = gamesRaw?.sort(game => (choosedOnes.includes(game.id) ? -1 : 1))

    return (
      <Sheet
        open={isOpen}
        onOpenChange={isOpening => setIsOpen(games ? isOpening : false)}
      >
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent
          {...props}
          className={cn("p-0 border-none bg-transparent", className)}
          ref={ref}
          side="right"
        >
          <div className="p-0 flex flex-col h-screen">
            <div className="absolute inset-0 bottom-[4.5rem] rounded-b-md border-l border-b border-slate-800 bg-background overflow-hidden">
              <SheetHeader className="pt-6 px-4">
                <SheetTitle>{title}</SheetTitle>
                <SheetDescription>
                  <Description />
                </SheetDescription>
              </SheetHeader>
              <main className="flex-1 overflow-y-scroll pb-14 mt-4 h-[calc(100%_-_8rem)]">
                <div className="flex flex-col gap-2 overflow-y-hidden">
                  {games ? (
                    games.map(game => (
                      <GameItem
                        game={game}
                        handleFarmGame={() => {}}
                        isSelected={choosedOnes.includes(game.id)}
                      />
                    ))
                  ) : (
                    <span className="pt-6 px-4 text-slate-600">Nenhum jogo encontrado.</span>
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
