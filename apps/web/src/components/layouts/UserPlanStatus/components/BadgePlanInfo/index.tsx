import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import React, { PropsWithChildren } from "react"

export type RootProps = React.ComponentPropsWithoutRef<"div"> & {}

export const Root = React.forwardRef<React.ElementRef<"div">, RootProps>(function RootComponent(
  { className, ...props },
  ref
) {
  return (
    <div
      {...props}
      className={cn("flex items-center transition-all duration-200", className)}
      ref={ref}
    />
  )
})

Root.displayName = "Root"

export type SubWrapperProps = React.ComponentPropsWithoutRef<"div"> & {}

export const SubWrapper = React.forwardRef<React.ElementRef<"div">, SubWrapperProps>(
  function SubWrapperComponent({ className, ...props }, ref) {
    return (
      <div
        {...props}
        className={cn(
          "border w-fit flex gap-1 items-center font-semibold text-xs px-1.5 h-[1.375rem]",
          className
        )}
        ref={ref}
      />
    )
  }
)

SubWrapper.displayName = "SubWrapper"

export type NumberProps = React.ComponentPropsWithoutRef<"div"> & {}

export const Number = React.forwardRef<React.ElementRef<"div">, NumberProps>(function NumberComponent(
  { children, className, ...props },
  ref
) {
  return (
    <div
      {...props}
      className={cn(
        "px-1.5 min-w-[1.375rem] h-[1.375rem] grid place-items-center border text-white font-semibold ",
        className
      )}
      ref={ref}
    >
      <span className="leading-none text-sm">{children}</span>
    </div>
  )
})

Number.displayName = "Number"

export type LabelProps = React.ComponentPropsWithoutRef<"span"> & {}

export const Label = React.forwardRef<React.ElementRef<"span">, LabelProps>(function LabelComponent(
  { className, ...props },
  ref
) {
  return (
    <span
      {...props}
      className={cn("-translate-y-[1px]", className)}
      ref={ref}
    />
  )
})

Label.displayName = "Label"

export type IconProps = PropsWithChildren & {
  className?: string
}

export function Icon({ className, children }: IconProps) {
  return <Slot className={cn("w-3.5 h-3.5", className)}>{children}</Slot>
}

export const BadgePlanInfo = {
  Root,
  Number,
  SubWrapper,
  Icon,
  Label,
}
