import { useUser } from "@/contexts/UserContext"
import { api } from "@/lib/axios"
import { DataOrMessage } from "@/util/DataOrMessage"
import { useAuth } from "@clerk/clerk-react"
import { DefaultError, useMutation, useQueryClient } from "@tanstack/react-query"
import { SteamAccountSession } from "core"
import React from "react"
import { toast } from "sonner"
import { RemoveSteamAccountPayload } from "../controller"
import { httpRemoveSteamAccount } from "../httpRequest"
import { AlertDialogRemoveSteamAccountView, AlertDialogRemoveSteamAccountViewProps } from "./alert-dialog"

export type ControllerProps = {
  steamAccount: SteamAccountSession
}

export type AlertDialogRemoveSteamAccountProps = AlertDialogRemoveSteamAccountViewProps & ControllerProps

export const AlertDialogRemoveSteamAccount = React.forwardRef<
  React.ElementRef<"div">,
  AlertDialogRemoveSteamAccountProps
>(function AlertDialogRemoveSteamAccountComponent({ ...props }, ref) {
  const queryClient = useQueryClient()
  const user = useUser()
  const { getToken } = useAuth()
  const getAPI = async () => {
    api.defaults.headers["Authorization"] = `Bearer ${await getToken()}`
    return api
  }

  const removeSteamAccount = useMutation<DataOrMessage<string>, DefaultError, RemoveSteamAccountPayload>({
    mutationFn: async (...args) => httpRemoveSteamAccount(...args, getAPI),
  })

  async function removeSteamAccountSubmit() {
    const toastId = toast.loading("Desvinculando conta.")
    const [error] = await removeSteamAccount.mutateAsync({
      accountName: props.steamAccount.accountName,
      steamAccountId: props.steamAccount.id_steamAccount,
      username: user.username,
    })
    toast.dismiss(toastId)
    if (error) {
      toast[error.type](error.message)
      return
    }
    console.log("removed account with success")
    toast.success("Conta da Steam removida do seu perfil.")
    queryClient.invalidateQueries({ queryKey: ["me", user.id] })
  }

  return (
    <AlertDialogRemoveSteamAccountView
      {...props}
      ref={ref}
      handleAction={removeSteamAccountSubmit}
    />
  )
})

AlertDialogRemoveSteamAccount.displayName = "AlertDialogRemoveSteamAccount"
