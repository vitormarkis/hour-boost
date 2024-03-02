import Image from "next/image"
import { ImagesGridGamesContainer } from "./ImagesGrid"

type ImagesGridManyProps = {
  source: string[]
}

export function ImagesGridMany({ source }: ImagesGridManyProps) {
  const [game1, game2, game3, ...rest] = source
  const restAmount = rest.length

  return (
    <ImagesGridGamesContainer>
      <div className="flex h-full w-[--games-container-width] flex-col">
        <div className="relative flex-1 overflow-hidden">
          <Image
            quality={3}
            src={game1}
            fill
            alt=""
            objectFit="cover"
          />
        </div>
        <div className="relative flex-1 overflow-hidden">
          <Image
            quality={3}
            src={game2}
            fill
            alt=""
            objectFit="cover"
          />
        </div>
      </div>
      <div className="flex h-full w-[--games-container-width] flex-col">
        <div className="relative flex-1 overflow-hidden">
          <Image
            quality={3}
            src={game3}
            fill
            alt=""
            objectFit="cover"
          />
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-slate-900 group-hover:bg-slate-700">
            <span className="text-2xs text-slate-300 group-hover:text-white">+ {restAmount}</span>
          </div>
        </div>
      </div>
    </ImagesGridGamesContainer>
  )
}
