import Image from "next/image"
import { ImagesGridGamesContainer } from "./ImagesGrid"

ImagesGridOne.displayName = "ImagesGridOne"

type ImagesGridOneProps = {
  source: string[]
}

export function ImagesGridOne({ source }: ImagesGridOneProps) {
  const [game1] = source

  return (
    <ImagesGridGamesContainer>
      <div className="flex flex-col h-full w-[calc(var(--games-container-width)*2)]">
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
    </ImagesGridGamesContainer>
  )
}
