import React from "react"
import { cn } from "@/lib/utils"
import { IconJoystick } from "@/components/icons/IconJoystick"
import Image from "next/image"

export type ImagesGridProps = React.ComponentPropsWithoutRef<"div"> & {
  source: string[]
}

export const ImagesGrid = React.forwardRef<React.ElementRef<"div">, ImagesGridProps>(
  function ImagesGridComponent({ source, className, ...props }, ref) {
    const [game1, game2, game3, game4, ...rest] = source
    const restAmount = rest.length

    return (
      <div
        {...props}
        className={cn("px-2 hover:bg-slate-800 group", className)}
        ref={ref}
      >
        <div className="h-[--container-height] items-center [--padding:0.5rem] pr-[calc(var(--padding)/2)] pl-[--padding] flex">
          <div className="flex items-center pr-2">
            <IconJoystick className="size-4 fill-slate-600 group-hover:fill-white transition-all duration-150" />
          </div>
          <div className="h-[calc(var(--container-height)_-_var(--padding))] flex">
            <div className="flex flex-col h-full w-12">
              <div className="flex-1 relative overflow-hidden">
                <Image
                  quality={30}
                  src={game1}
                  fill
                  alt=""
                />
              </div>
              <div className="flex-1 relative overflow-hidden">
                <Image
                  quality={30}
                  src={game2}
                  fill
                  alt=""
                />
              </div>
            </div>
            <div className="flex flex-col h-full w-12">
              <div className="flex-1 relative overflow-hidden">
                <Image
                  quality={30}
                  src={game3}
                  fill
                  alt=""
                />
              </div>
              <div className="flex-1 relative overflow-hidden">
                <div className="absolute inset-0 h-full w-full bg-slate-900 group-hover:bg-slate-700 flex items-center justify-center">
                  <span className="text-2xs text-slate-300 group-hover:text-white">+ {restAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

ImagesGrid.displayName = "ImagesGrid"
