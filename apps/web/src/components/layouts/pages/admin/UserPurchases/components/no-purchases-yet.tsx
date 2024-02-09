import React from "react"
import { cn } from "@/lib/utils"
import { useUserAdminItem } from "../../UserItemAction/context"

export type NoPurchasesYetProps = React.ComponentPropsWithoutRef<"div"> & {}

export const NoPurchasesYet = React.forwardRef<React.ElementRef<"div">, NoPurchasesYetProps>(
  function NoPurchasesYetComponent({ className, ...props }, ref) {
    const username = useUserAdminItem(user => user.username)

    return (
      <h3
        {...props}
        className={cn("text-center mt-4 text-slate-500", className)}
        ref={ref}
      >
        O usuário <strong>{username}</strong> ainda não fez nenhuma compra, assinatura ou transação na
        plataforma.
      </h3>
    )
  }
)

NoPurchasesYet.displayName = "NoPurchasesYet"
