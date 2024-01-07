import { api } from "@/lib/axios"
import { DataOrMessage } from "@/util/DataOrMessage"
import { useAuth } from "@clerk/clerk-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { DefaultError, useMutation } from "@tanstack/react-query"
import React from "react"
import { useForm } from "react-hook-form"
import { FormType, formSchema } from "./form"
import { httpCreateSteamAccount } from "./httpRequest"
import { IntentionCodes, ModalAddSteamAccountView } from "./view"

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

  const createSteamAccount = useMutation<
    DataOrMessage<string, IntentionCodes>,
    DefaultError,
    CreateSteamAccountPayload
  >({
    mutationFn: async (...args) => httpCreateSteamAccount(...args, getAPI),
  })

  const clearField = (field: keyof FormType) => {
    form.resetField(field)
  }

  return (
    <ModalAddSteamAccountView
      {...props}
      createSteamAccount={createSteamAccount}
      form={form}
      resetAllFields={resetAllFields}
      clearField={clearField}
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
