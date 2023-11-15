import React, { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AddSteamAccountInput, AddSteamAccountOutput, IAddSteamAccount, UserSession } from "core"
import { useAuth } from "@clerk/clerk-react"
import { api } from "@/lib/axios"
import { AxiosError, AxiosInstance, AxiosResponse } from "axios"
import { DefaultError, useMutation, useQueryClient } from "@tanstack/react-query"

export type ModalAddSteamAccountProps = React.ComponentPropsWithoutRef<typeof DialogContent> & {
  children: React.ReactNode
  userId: UserSession["id_user"]
}

export const ModalAddSteamAccount = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  ModalAddSteamAccountProps
>(function ModalAddSteamAccountComponent({ userId, children, className, ...props }, ref) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { getToken } = useAuth()
  const getAPI = async () => {
    api.defaults.headers["Authorization"] = `Bearer ${await getToken()}`
    return api
  }
  const [accountName, setAccountName] = React.useState("")
  const [password, setPassword] = React.useState("")
  const queryClient = useQueryClient()

  const { mutate: createSteamAccount } = useMutation<
    AddSteamAccountOutput,
    DefaultError,
    CreateSteamAccountPayload
  >({
    mutationFn: async (...args) => httpCreateSteamAccount(...args, getAPI),
    onSuccess: () => {
      console.log("Invalidando cache de steam accounts")
      queryClient.invalidateQueries({
        queryKey: ["steam-accounts", userId],
      })
      setIsModalOpen(false)
    },
    onError: error => {
      alert(error.message)
    },
  })

  const handleSubmit = async () => {
    createSteamAccount({ accountName, password })
  }

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={setIsModalOpen}
    >
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
          <Label>Account Name</Label>
          <Input
            value={accountName}
            onChange={e => setAccountName(e.target.value)}
            placeholder="Account name..."
          />
          <Label>Password</Label>
          <Input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            placeholder="Password..."
          />
          steam guard
          <Button onClick={handleSubmit}>Enviar</Button>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
})

ModalAddSteamAccount.displayName = "ModalAddSteamAccount"

export async function httpCreateSteamAccount(
  props: CreateSteamAccountPayload,
  getAPI: () => Promise<AxiosInstance>
) {
  try {
    const api = await getAPI()
    const response = await api.post<
      { name: number },
      AxiosResponse<AddSteamAccountOutput>,
      CreateSteamAccountPayload
    >("/steam-accounts", {
      accountName: props.accountName,
      password: props.password,
    })

    return response.data
  } catch (error) {
    console.log(error)
    if (error instanceof AxiosError) {
      throw new Error((error.response?.data as DefaultErrorHTTP).message ?? "Erro desconhecido.")
    }
    if (error.message) {
      throw new Error(error.message)
    }
    throw new Error("Erro interno no servidor. [#909]")
  }
}

type CreateSteamAccountPayload = Omit<IAddSteamAccount, "userId">

export type DefaultErrorHTTP = {
  message: string
}

export function isResponseOK(status: number) {
  return status >= 200 && status <= 299
}
