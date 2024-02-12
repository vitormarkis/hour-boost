import Image from "next/image"
import { ImagesGridGamesContainer } from "./ImagesGrid"

type ImagesGridSomeProps = {
  source: string[]
}

export function ImagesGridSome({ source }: ImagesGridSomeProps) {
  const [game1, ...rest] = source
  const restAmount = rest.length

  return (
    <ImagesGridGamesContainer>
      <div className="flex flex-col h-full w-[--games-container-width]">
        <div className="flex-1 relative overflow-hidden">
          <Image
            quality={20}
            src={game1}
            fill
            alt=""
            className="object-cover"
          />
        </div>
      </div>
      <div className="flex flex-col h-full w-[--games-container-width]">
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 h-full w-full bg-slate-900 group-hover:bg-slate-700 flex items-center justify-center">
            <span className="text-xs text-slate-300 group-hover:text-white">+ {restAmount}</span>
          </div>
        </div>
      </div>
    </ImagesGridGamesContainer>
  )
}
