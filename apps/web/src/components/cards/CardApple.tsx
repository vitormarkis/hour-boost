import React from "react"
import { cn } from "@/lib/utils"

export type CardAppleRootProps = React.ComponentPropsWithoutRef<"div"> & {
  children: React.ReactNode
}

const CardAppleRoot = React.forwardRef<React.ElementRef<"div">, CardAppleRootProps>(
  function CardAppleRootComponent({ children, className, ...props }, ref) {
    return (
      <div
        {...props}
        className={cn("flex flex-1 flex-col items-center overflow-hidden", className)}
        ref={ref}
      >
        <div className="h-[1px] w-[60%] bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        <div className="relative flex w-full flex-col items-center">
          <div className="absolute left-1/2 top-0 h-[7rem] w-[7rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-500/70 blur-[60px]" />
          {children}
        </div>
      </div>
    )
  }
)

CardAppleRoot.displayName = "CardApple"

export type CardAppleTitleProps = React.ComponentPropsWithoutRef<"div"> & {
  children: React.ReactNode
}

const CardAppleTitle = React.forwardRef<React.ElementRef<"div">, CardAppleTitleProps>(
  function CardAppleTitleComponent({ children, className, ...props }, ref) {
    return (
      <div
        {...props}
        className={cn(
          "flex w-full justify-center px-[1.5rem] pt-4 text-lg font-semibold uppercase",
          className
        )}
        ref={ref}
      >
        <h2>{children}</h2>
      </div>
    )
  }
)

CardAppleTitle.displayName = "CardAppleTitle"

export type CardAppleMainAssetProps = React.ComponentPropsWithoutRef<"div"> & {
  maskURL: string
}

const CardAppleMainAsset = React.forwardRef<React.ElementRef<"div">, CardAppleMainAssetProps>(
  function CardAppleMainAssetComponent({ maskURL, className, ...props }, ref) {
    return (
      <div
        {...props}
        className={cn("relative mt-4 h-[7rem] w-[7rem]", className)}
        ref={ref}
        style={{
          background: "linear-gradient(-180deg, hsl(var(--accent)) 30%, #213d57 92%)",
          WebkitMaskImage: `url(${maskURL})`,
          maskType: "alpha",
          maskSize: "contain",
          WebkitMaskSize: "contain",
        }}
      />
    )
  }
)

CardAppleMainAsset.displayName = "CardAppleMainAsset"

export const CardApple = {
  Root: CardAppleRoot,
  Title: CardAppleTitle,
  MainAsset: CardAppleMainAsset,
}
