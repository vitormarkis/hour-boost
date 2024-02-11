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
import { useUserAdminItemId } from "../../UserItemAction/context"
import { twc } from "react-twc"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useUserAdminActionUnbanUser } from "../mutation"
import { toast } from "sonner"
import { useUserAdminListItem } from "../../hooks/useUserAdminListItem"

export type AlertDialogUnbanUserProps = React.ComponentPropsWithoutRef<typeof AlertDialogContent> & {
  children: React.ReactNode
}

export const AlertDialogUnbanUser = React.forwardRef<
  React.ElementRef<typeof AlertDialogContent>,
  AlertDialogUnbanUserProps
>(function AlertDialogUnbanUserComponent({ children, className, ...props }, ref) {
  const userId = useUserAdminItemId()
  const username = useUserAdminListItem(userId, user => user.username)
  const [input, setInput] = useState("")
  const hasTypedDesbanir = input === "DESBANIR"

  const unbanUserMutation = useUserAdminActionUnbanUser({ userId })

  const handleUnbanUser = () => {
    unbanUserMutation.mutate(
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
          <AlertDialogTitle>Desbanir {username}</AlertDialogTitle>
          <AlertDialogDescription>
            Para desbanir {username}, digite <Accent>DESBANIR</Accent> e clique em confirmar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div>
          <Input
            placeholder="DESBANIR"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              disabled={!hasTypedDesbanir}
              onClick={handleUnbanUser}
            >
              Confirmar
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})

AlertDialogUnbanUser.displayName = "AlertDialogUnbanUser"

const Accent = twc.span`inline-flex items-center text-xs/none h-4 rounded-sm px-2 bg-accent text-white font-semibold`
