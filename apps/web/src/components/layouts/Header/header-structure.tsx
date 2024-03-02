import React from "react"
import { cn } from "@/lib/utils"

export type HeaderStructureProps = React.ComponentPropsWithoutRef<"div"> & {
  children: React.ReactNode
}

export const HeaderStructure = React.forwardRef<React.ElementRef<"div">, HeaderStructureProps>(
  function HeaderStructureComponent({ children, className, ...props }, ref) {
    return (
      <header className="relative z-40 flex h-14 items-center border-b border-white/10 bg-black/30 backdrop-blur-sm">
        <div
          className={cn("mx-auto flex h-full w-full max-w-[1440px] items-center px-4 sm:px-8", className)}
          {...props}
          ref={ref}
        >
          {children}
        </div>
      </header>
    )
  }
)

HeaderStructure.displayName = "HeaderStructure"
