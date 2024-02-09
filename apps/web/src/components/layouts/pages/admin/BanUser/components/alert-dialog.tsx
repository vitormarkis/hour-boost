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
import { IconArrowClockwise } from "@/components/icons/IconArrowClockwise"
import { isMutationPending } from "../../UserItemAction/ActionSetGamesLimit/components/MenuSubContent"
import { ECacheKeys } from "@/mutations/queryKeys"

export type AlertDialogBanUserProps = React.ComponentPropsWithoutRef<typeof AlertDialogContent> & {
  children: React.ReactNode
}

export const AlertDialogBanUser = React.forwardRef<
  React.ElementRef<typeof AlertDialogContent>,
  AlertDialogBanUserProps
>(function AlertDialogBanUserComponent({ children, className, ...props }, ref) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const username = useUserAdminItem(user => user.username)
  const userId = useUserAdminItem(user => user.id_user)
  const [input, setInput] = useState("")
  const hasTypedHourboost = input === "HOURBOOST"

  const banUserMutation = useUserAdminActionBanUser({ userId })
  const isBanningUser = isMutationPending(ECacheKeys.banUser(userId))

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

          setIsDialogOpen(false)
          toast.success(message)
        },
      }
    )
  }

  return (
    <AlertDialog
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
    >
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent
        {...props}
        className={cn("", className)}
        ref={ref}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Banir {username}</AlertDialogTitle>
          <AlertDialogDescription>
            Para banir {username} por tempo indeterminado, digite <Accent>HOURBOOST</Accent> e clique em
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
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button
            disabled={!hasTypedHourboost || isBanningUser}
            onClick={handleBanUser}
            className="relative px-12"
          >
            <span>Confirmar</span>
            {isBanningUser && (
              <div className="absolute top-1/2 -translate-y-1/2 right-4">
                <IconArrowClockwise className="w-4 h-4 animate-spin" />
              </div>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})

AlertDialogBanUser.displayName = "AlertDialogBanUser"

const Accent = twc.span`inline-flex items-center text-xs/none h-4 rounded-sm px-2 bg-accent text-white font-semibold`
