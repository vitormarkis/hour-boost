import { ImagesGridMany } from "./ImagesGridMany"
import { ImagesGridNoSource } from "./ImagesGridNoSource"
import { ImagesGridOne } from "./ImagesGridOne"
import { ImagesGridSome } from "./ImagesGridSome"
import React from "react"
import { cn } from "@/lib/utils"

type ImagesGridContentProps = {
  source: string[]
}

export function ImagesGridContent({ source }: ImagesGridContentProps) {
  if (source.length >= 5) return <ImagesGridMany source={source} />
  if (source.length >= 2) return <ImagesGridSome source={source} />
  if (source.length > 0) return <ImagesGridOne source={source} />
  return <ImagesGridNoSource />
}

export type ImagesGridProps = React.ComponentPropsWithoutRef<"div"> & {
  children: React.ReactNode
}

export const ImagesGrid = React.forwardRef<React.ElementRef<"div">, ImagesGridProps>(
  function ImagesGridComponent({ children, className, ...props }, ref) {
    return (
      <div
        {...props}
        className={cn("px-2 hover:bg-slate-800 group", className)}
        ref={ref}
      >
        <div className="h-[--container-height] items-center [--padding:0.5rem] pr-[calc(var(--padding)/2)] pl-[--padding] flex">
          <div className="flex items-center pr-2">{children}</div>
        </div>
      </div>
    )
  }
)

ImagesGrid.displayName = "ImagesGrid"

export type ImagesGridGamesContainerProps = React.ComponentPropsWithoutRef<"div"> & {}

export const ImagesGridGamesContainer = React.forwardRef<
  React.ElementRef<"div">,
  ImagesGridGamesContainerProps
>(function ImagesGridGamesContainerComponent({ className, ...props }, ref) {
  return (
    <div
      {...props}
      className={cn(
        "h-[calc(var(--container-height)_-_var(--padding))] flex [--games-container-width:3rem]",
        className
      )}
      ref={ref}
    />
  )
})

ImagesGridGamesContainer.displayName = "ImagesGridGamesContainer"

export type ImagesGridIconWrapperProps = React.ComponentPropsWithoutRef<"div"> & {}

export const ImagesGridIconWrapper = React.forwardRef<React.ElementRef<"div">, ImagesGridIconWrapperProps>(
  function ImagesGridIconWrapperComponent({ className, ...props }, ref) {
    return (
      <div
        {...props}
        className={cn("flex items-center pr-2", className)}
        ref={ref}
      />
    )
  }
)

ImagesGridIconWrapper.displayName = "ImagesGridIconWrapper"
