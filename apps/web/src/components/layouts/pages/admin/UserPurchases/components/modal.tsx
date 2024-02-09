import React, { CSSProperties } from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useUserAdminItem } from "../../UserItemAction/context"
import { PurchaseItem } from "./purchase-item"
import { NoPurchasesYet } from "./no-purchases-yet"
import { PurchaseListHeader } from "./purchase-list-header"

const columnsWidth = {
  "--width-id": "4.37rem",
  "--width-type": "9.37rem",
  "--width-payload": "12.5rem",
  "--width-when": "6.87rem",
  "--width-value": "6.87rem",
} as CSSProperties

export type ModalSeeUserPurchasesProps = React.ComponentPropsWithoutRef<typeof DialogContent> & {
  children: React.ReactNode
}

export const ModalSeeUserPurchases = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  ModalSeeUserPurchasesProps
>(function ModalSeeUserPurchasesComponent({ children, className, ...props }, ref) {
  const username = useUserAdminItem(user => user.username)
  const purchases = useUserAdminItem(user => user.purchases)

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        {...props}
        className={cn("max-w-[80rem] w-full", className)}
        ref={ref}
      >
        <DialogHeader>
          <DialogTitle>Transações de {username}</DialogTitle>
          <DialogDescription>
            Veja o histórico de compras, assinaturas e transações que <strong>{username}</strong> fez na
            Hourboost.
          </DialogDescription>
          <div
            className="pt-6"
            style={columnsWidth}
          >
            <PurchaseListHeader />
            <ul className="flex flex-col bg-slate-900 p-[2px] gap-[2px] min-h-[50vh] rounded-[8px]">
              {purchases.length > 0 ? (
                purchases.map(purchase => (
                  <PurchaseItem
                    key={purchase.id_Purchase}
                    purchase={purchase}
                    className="bg-slate-950 rounded-[6px]"
                  />
                ))
              ) : (
                <NoPurchasesYet />
              )}
            </ul>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
})

ModalSeeUserPurchases.displayName = "ModalSeeUserPurchases"
