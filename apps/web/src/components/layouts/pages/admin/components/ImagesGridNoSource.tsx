import { ImagesGridGamesContainer } from "./ImagesGrid"

type ImagesGridNoSourceProps = {}

export function ImagesGridNoSource({}: ImagesGridNoSourceProps) {
  return (
    <ImagesGridGamesContainer className="w-[calc(var(--games-container-width)*2)] items-center justify-center bg-slate-900 group-hover:bg-slate-700">
      <span className="text-xs text-slate-300 group-hover:text-white">0 games</span>
    </ImagesGridGamesContainer>
  )
}
