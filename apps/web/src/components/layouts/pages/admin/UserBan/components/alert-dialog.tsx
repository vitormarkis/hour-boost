import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { useUserAdminItem } from "../../UserItemAction/context"
import { twc } from "react-twc"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useUserAdminActionBanUser } from "../mutation"
import { toast } from "sonner"

export type AlertDialogBanUserProps = React.ComponentPropsWithoutRef<typeof AlertDialogContent> & {
  children: React.ReactNode
}

export const AlertDialogBanUser = React.forwardRef<
  React.ElementRef<typeof AlertDialogContent>,
  AlertDialogBanUserProps
>(function AlertDialogBanUserComponent({ children, className, ...props }, ref) {
  const username = useUserAdminItem(user => user.username)
  const userId = useUserAdminItem(user => user.id_user)
  const [input, setInput] = useState("")
  const hasTypedHourboost = input === "HOURBOOST"

  const banUserMutation = useUserAdminActionBanUser()

  const handleBanUser = () => {
    banUserMutation.mutate(
      {
        userId,
        username,
      },
      {
        onSuccess([undesired, message]) {
          if (undesired) {
            toast[undesired.type](undesired.message)
            return
          }

          toast.success(message)
        },
      }
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent
        {...props}
        className={cn("", className)}
        ref={ref}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Banir {username}</AlertDialogTitle>
          <AlertDialogDescription>
            Para banir {username} por tempo indeterminado, escreva <Accent>HOURBOOST</Accent> e clique em
            confirmar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div>
          <Input
            placeholder="HOURBOOST"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              disabled={!hasTypedHourboost}
              onClick={handleBanUser}
            >
              Confrmar
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})

AlertDialogBanUser.displayName = "AlertDialogBanUser"

const Accent = twc.span`inline-flex items-center text-xs/none h-4 rounded-sm px-2 bg-accent text-white font-semibold`
