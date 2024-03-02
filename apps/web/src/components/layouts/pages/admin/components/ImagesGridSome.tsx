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
      <div className="flex h-full w-[--games-container-width] flex-col">
        <div className="relative flex-1 overflow-hidden">
          <Image
            quality={20}
            src={game1}
            fill
            alt=""
            className="object-cover"
          />
        </div>
      </div>
      <div className="flex h-full w-[--games-container-width] flex-col">
        <div className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-slate-900 group-hover:bg-slate-700">
            <span className="text-xs text-slate-300 group-hover:text-white">+ {restAmount}</span>
          </div>
        </div>
      </div>
    </ImagesGridGamesContainer>
  )
}
