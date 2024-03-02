import { cn } from "@/lib/utils"
import React from "react"
import { useUserAdminItemId } from "../../UserItemAction/context"
import { useUserAdminListItem } from "../../hooks/useUserAdminListItem"

export type NoPurchasesYetProps = React.ComponentPropsWithoutRef<"div"> & {}

export const NoPurchasesYet = React.forwardRef<React.ElementRef<"div">, NoPurchasesYetProps>(
  function NoPurchasesYetComponent({ className, ...props }, ref) {
    const userId = useUserAdminItemId()
    const username = useUserAdminListItem(userId, user => user.username)

    return (
      <h3
        {...props}
        className={cn("mt-4 text-center text-slate-500", className)}
        ref={ref}
      >
        O usuário <strong>{username}</strong> ainda não fez nenhuma compra, assinatura ou transação na
        plataforma.
      </h3>
    )
  }
)

NoPurchasesYet.displayName = "NoPurchasesYet"
