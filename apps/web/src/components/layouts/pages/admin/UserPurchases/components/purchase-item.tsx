import React from "react"
import { cn } from "@/lib/utils"
import { PurchaseSession } from "@/pages/admin"
import { twc } from "react-twc"
import { getTypeText } from "../utils/getTypeText"
import { PurchasePayload } from "./purchase-payload"

export type PurchaseItemProps = React.ComponentPropsWithoutRef<"li"> & {
  purchase: PurchaseSession
}

export const PurchaseItem = React.forwardRef<React.ElementRef<"li">, PurchaseItemProps>(
  function PurchaseItemComponent({ purchase, className, ...props }, ref) {
    const { id_Purchase, type, when, valueInCents } = purchase
    const typeName = getTypeText(type.name)

    const formatter = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    })

    return (
      <li
        {...props}
        className={cn("h-12 px-6 flex items-center", className)}
        ref={ref}
      >
        <Item className="w-[--width-id]">
          <span className="whitespace-nowrap text-sm text-slate-500">{id_Purchase.substring(0, 7)}...</span>
        </Item>
        <Separator />
        <Item className="w-[--width-type]">
          <span className="leading/none px-1.5 h-5 text-xs flex items-center bg-accent font-medium rounded-sm">
            {typeName}
          </span>
        </Item>
        <Separator />
        <Item className="w-[--width-payload]">
          <PurchasePayload purchase={purchase} />
        </Item>
        <Separator />
        <Item className="w-[--width-when]">
          <span className="text-sm/none flex items-center font-medium">
            {when.toLocaleDateString("pt-Br", { dateStyle: "medium" })}
          </span>
        </Item>
        <Separator />
        <Item className="w-[--width-value]">
          <span className="tabular-nums text-sm/none flex items-center font-medium">
            {formatter.format(valueInCents / 100)}
          </span>
        </Item>
      </li>
    )
  }
)

PurchaseItem.displayName = "PurchaseItem"

const Item = twc.div`flex items-center`
const Separator = twc.i`pl-4 mr-4 h-full border-r border-slate-900`
