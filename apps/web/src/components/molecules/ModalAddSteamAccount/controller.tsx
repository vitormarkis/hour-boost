import { api } from "@/lib/axios"
import { useAuth } from "@clerk/clerk-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { DefaultError, useMutation } from "@tanstack/react-query"
import { DataOrError } from "core"
import React from "react"
import { useForm } from "react-hook-form"
import { FormType, formSchema } from "./form"
import { httpCreateSteamAccount } from "./httpRequest"
import { ModalAddSteamAccountView } from "./view"

const defaultValues: FormType = {
  accountName: "",
  authCode: "",
  password: "",
}

export type ModalAddSteamAccountProps = {
  children: React.ReactNode
}

export const ModalAddSteamAccount = React.forwardRef<
  React.ElementRef<typeof ModalAddSteamAccountView>,
  ModalAddSteamAccountProps
>(function ModalAddSteamAccountComponent({ children, ...props }, ref) {
  const form = useForm<FormType>({
    mode: "onSubmit",
    defaultValues,
    resolver: zodResolver(formSchema),
  })
  const resetAllFields = () => form.reset(defaultValues)

  const { getToken } = useAuth()
  const getAPI = async () => {
    api.defaults.headers["Authorization"] = `Bearer ${await getToken()}`
    return api
  }

  const createSteamAccount = useMutation<DataOrError<string>, DefaultError, CreateSteamAccountPayload>({
    mutationFn: async (...args) => httpCreateSteamAccount(...args, getAPI),
  })

  return (
    <ModalAddSteamAccountView
      {...props}
      createSteamAccount={createSteamAccount}
      form={form}
      resetAllFields={resetAllFields}
      ref={ref}
    >
      {children}
    </ModalAddSteamAccountView>
  )
})

ModalAddSteamAccount.displayName = "ModalAddSteamAccount"

export type CreateSteamAccountPayload = {
  accountName: string
  password: string
  authCode?: string
}
