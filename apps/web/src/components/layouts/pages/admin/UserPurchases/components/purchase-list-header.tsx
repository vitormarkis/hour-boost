import React from "react"
import { cn } from "@/lib/utils"
import { twc } from "react-twc"

export type PurchaseListHeaderProps = React.ComponentPropsWithoutRef<"div"> & {}

export const PurchaseListHeader = React.forwardRef<React.ElementRef<"div">, PurchaseListHeaderProps>(
  function PurchaseListHeaderComponent({ className, ...props }, ref) {
    return (
      <div
        {...props}
        className={cn("h-9 px-6", className)}
        ref={ref}
      >
        <div className="flex items-center h-full px-[2px]">
          <Head className="w-[--width-id]">ID</Head>
          <Separator />
          <Head className="w-[--width-type]">tipo</Head>
          <Separator />
          <Head className="w-[--width-payload]">detalhes</Head>
          <Separator />
          <Head className="w-[--width-when]">quando</Head>
          <Separator />
          <Head className="w-[--width-value]">valor</Head>
        </div>
      </div>
    )
  }
)

PurchaseListHeader.displayName = "PurchaseListHeader"
const Separator = twc.i`pl-4 mr-4 h-full w-[1px]`
const Head = twc.h3`font-bold text-slate-600`
