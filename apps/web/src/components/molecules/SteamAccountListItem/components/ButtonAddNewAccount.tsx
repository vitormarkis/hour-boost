import React from "react"
import { cn } from "@/lib/utils"
import { ModalAddSteamAccount } from "@/components/molecules/ModalAddSteamAccount/controller"
import { Button } from "@/components/ui/button"

export type ButtonAddNewAccountProps = React.ComponentPropsWithoutRef<typeof Button> & {}

export const ButtonAddNewAccount = React.forwardRef<
  React.ElementRef<typeof Button>,
  ButtonAddNewAccountProps
>(function ButtonAddNewAccountComponent({ className, ...props }, ref) {
  return (
    <ModalAddSteamAccount>
      <Button
        {...props}
        className={cn(
          "border-t border-x border-slate-800 bg-transparent text-white hover:bg-slate-800",
          className
        )}
        ref={ref}
      >
        Adicionar outra conta
      </Button>
    </ModalAddSteamAccount>
  )
})

ButtonAddNewAccount.displayName = "ButtonAddNewAccount"
