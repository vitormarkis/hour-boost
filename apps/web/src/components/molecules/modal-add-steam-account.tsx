import React from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export type ModalAddSteamAccountProps = React.ComponentPropsWithoutRef<typeof DialogContent> & {
  children: React.ReactNode
}

export const ModalAddSteamAccount = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  ModalAddSteamAccountProps
>(function ModalAddSteamAccountComponent({ children, className, ...props }, ref) {
  return (
    <Dialog open>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        {...props}
        className={cn("", className)}
        ref={ref}
      >
        <DialogHeader>
          <DialogTitle>Adicionar conta Steam</DialogTitle>
          <DialogDescription>
            texto para adição de conta da steam texto para adição de conta da steam texto para adição de conta
            da steam
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
})

ModalAddSteamAccount.displayName = "ModalAddSteamAccount"
