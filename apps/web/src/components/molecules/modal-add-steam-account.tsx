import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/axios"
import { cn } from "@/lib/utils"
import { useAuth } from "@clerk/clerk-react"
import { DefaultError, useMutation } from "@tanstack/react-query"
import { AxiosInstance, AxiosResponse } from "axios"
import { AddSteamAccountOutput, ApplicationError, DataOrError, IAddSteamAccount } from "core"
import React, { useRef, useState } from "react"
import FlipMove from "react-flip-move"
import { SubmitHandler, useForm } from "react-hook-form"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconSpinner } from "@/components/icons/IconSpinner"
import { toast } from "sonner"

export type ModalAddSteamAccountProps = React.ComponentPropsWithoutRef<"form"> & {
  children: React.ReactNode
}

const formSchema = z.object({
  accountName: z.string(),
  password: z.string(),
  authCode: z.string().optional(),
})

type FormType = z.infer<typeof formSchema>
const defaultValues: FormType = {
  accountName: "",
  authCode: "",
  password: "",
}

export const ModalAddSteamAccount = React.forwardRef<React.ElementRef<"form">, ModalAddSteamAccountProps>(
  function ModalAddSteamAccountComponent({ children, className, ...props }, ref) {
    const { register, handleSubmit, watch, reset } = useForm<FormType>({
      defaultValues,
      resolver: zodResolver(formSchema),
    })

    const { getToken } = useAuth()
    const getAPI = async () => {
      api.defaults.headers["Authorization"] = `Bearer ${await getToken()}`
      return api
    }
    const resetAllFields = () => reset(defaultValues)
    const s = useStater(watch("accountName"), resetAllFields)

    const createSteamAccount = useMutation<DataOrError<string>, DefaultError, CreateSteamAccountPayload>({
      mutationFn: async (...args) => httpCreateSteamAccount(...args, getAPI),
    })

    const handleCredentials = async (accountName: string, password: string) => {
      s.form.steps["CREDENTIALS"].submit()
      const [error, steamAccountId] = await createSteamAccount.mutateAsync({
        accountName,
        password,
      })
      s.form.steps["CREDENTIALS"].resolveSubmit()
      if (typeof steamAccountId === "string") {
        toast("Conta adicionada com sucesso.")
        return
      }
      if (error.status == 202) {
        s.requireSteamGuard()
        toast("Steam Guard requerido.")
      }
      console.log(error, steamAccountId)
      toast("Erro desconhecido.")
    }

    const handleSteamGuard = async (accountName: string, password: string, authCode: string) => {
      s.form.steps["STEAM-GUARD"].submit()
      const [error, steamAccountId] = await createSteamAccount.mutateAsync({
        accountName,
        password,
        authCode,
      })
      s.form.steps["STEAM-GUARD"].resolveSubmit()
      if (typeof steamAccountId === "string") {
        toast("Conta adicionada com sucesso.")
        return s.completeForm()
      }
      if (error.status == 202) {
        return toast("Steam Guard requerido.")
      }
      console.log(error, steamAccountId)
      toast("Erro desconhecido.")
    }

    const submitHandler: SubmitHandler<z.infer<typeof formSchema>> = async ({
      accountName,
      password,
      authCode,
    }) => {
      console.log({
        accountName,
        password,
        authCode,
      })
      if (s.formStep === "CREDENTIALS") await handleCredentials(accountName, password)
      if (s.formStep === "STEAM-GUARD") await handleSteamGuard(accountName, password, authCode!)
      return
      // createSteamAccount({ accountName, password })
    }

    return (
      <Dialog
        open={s.isModalOpen}
        onOpenChange={isOpen => (isOpen ? s.openModal() : s.closeModal())}
      >
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <form
            {...props}
            ref={ref}
            className={cn("border-slate-900", className)}
            onSubmit={handleSubmit(submitHandler)}
          >
            <DialogHeader>
              <DialogTitle>Adicionar conta Steam</DialogTitle>
              <DialogDescription className="pb-4">
                Para adicionar uma nova conta da Steam ao seu dashboard, preencha os campos abaixo e clique em
                enviar. Caso seu login peça <strong>Steam Guard</strong>, preencha o campo e submeta
                novamente.
              </DialogDescription>
            </DialogHeader>
            <div className="pb-4">
              {/* <FlipMove
                easing="ease"
                enterAnimation="fade"
                leaveAnimation="fade"
                staggerDelayBy={100}
                staggerDurationBy={100}
                duration={500}
                maintainContainerHeight
              > */}
              <div className="pb-1">
                <Label
                  data-disabled={s.isRequiringSteamGuard}
                  className="data-[disabled=true]:text-slate-500"
                >
                  Nome da conta
                </Label>
                <Input
                  {...register("accountName")}
                  placeholder="account name"
                  disabled={s.isRequiringSteamGuard}
                  ref={s.refInputAccountName}
                />
              </div>
              <div className="pb-1">
                <Label
                  data-disabled={s.isRequiringSteamGuard}
                  className="data-[disabled=true]:text-slate-500"
                >
                  Senha
                </Label>
                <Input
                  {...register("password")}
                  type="password"
                  placeholder="password"
                  disabled={s.isRequiringSteamGuard}
                />
              </div>
              {s.isRequiringSteamGuard && (
                <div className="pb-1">
                  <Label className="data-[disabled=true]:text-slate-500">Código Steam Guard</Label>
                  <div className="relative w-full">
                    <div className="absolute right-4 bottom-full">
                      <strong
                        onClick={s.goBackToCredentials}
                        className="underline text-xs cursor-pointer font-medium text-accent"
                      >
                        Voltar
                      </strong>
                    </div>
                    <Input
                      {...register("authCode")}
                      ref={s.refInputSteamGuard}
                      placeholder="JS82K9"
                      autoFocus
                    />
                  </div>
                </div>
              )}
              {/* </FlipMove> */}
            </div>
            <Button
              // disabled={s.isSubmitting}
              type="submit"
              className="relative"
              onClick={() => console.log("enviar clicked")}
            >
              {s.isSubmitting
                ? s.form.steps[s.formStep].textSubmittingButton
                : s.form.steps[s.formStep].textSubmitButton}
              {s.isSubmitting && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <IconSpinner className="h-5 w-5" />
                </div>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    )
  }
)

ModalAddSteamAccount.displayName = "ModalAddSteamAccount"

type FormStep = "CREDENTIALS" | "STEAM-GUARD"

type IFormSteps = Record<
  FormStep,
  {
    submit(): void
    resolveSubmit(): void
    textSubmitButton: string
    textSubmittingButton: string
  }
>

export function useStater(accountName: string, resetAllFields: () => void) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // const [isRequiringSteamGuard, setIsRequiringSteamGuard] = useState(false)
  const [formStep, setFormStep] = useState<FormStep>("CREDENTIALS")
  const [requiredSteamGuardAccounts, setRequiredSteamGuardAccounts] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const refInputSteamGuard = useRef<HTMLInputElement | null>(null)
  const refInputAccountName = useRef<HTMLInputElement | null>(null)
  const requireSteamGuard = () => {
    setFormStep("STEAM-GUARD")
    setRequiredSteamGuardAccounts(an => (an.includes(accountName) ? an : [...an, accountName]))
    refInputSteamGuard.current?.focus()
  }
  const resetFormFields = () => resetAllFields()
  const resetForm = () => {
    setFormStep("CREDENTIALS")
    resetFormFields()
    setIsSubmitting(false)
  }
  const isRequiringSteamGuard = formStep === "STEAM-GUARD"

  function useStaterForm() {
    return {
      form: {
        steps: {
          CREDENTIALS: {
            submit() {
              // CHECAGEM PARA SABER QUE USUARIO JA TEM UMA CONTA STEAM NO DASHBOARD COM ESSE NOME
              if (requiredSteamGuardAccounts.includes(accountName)) {
                setFormStep("STEAM-GUARD")
                return
              }
              setIsSubmitting(true)
            },
            resolveSubmit() {
              setIsSubmitting(false)
              closeModal()
            },
            textSubmitButton: "Enviar",
            textSubmittingButton: "Enviando...",
          },
          "STEAM-GUARD": {
            submit() {
              setIsSubmitting(true)
            },
            resolveSubmit() {
              setIsSubmitting(false)
            },
            textSubmitButton: "Enviar código",
            textSubmittingButton: "Enviando código...",
          },
        } satisfies IFormSteps,
      },
    }
  }

  const { form } = useStaterForm()

  const closeModal = () => {
    setIsModalOpen(false)
    resetForm()
  }
  const openModal = () => {
    setIsModalOpen(true)
  }
  const removeAccountNameFromSteamGuardCache = () =>
    setRequiredSteamGuardAccounts(ra => ra.filter(acc => acc !== accountName))
  const completeForm = () => {
    removeAccountNameFromSteamGuardCache()
    closeModal()
  }
  const goBackToCredentials = () => {
    setFormStep("CREDENTIALS")
    setTimeout(() => refInputAccountName.current?.focus(), 1)
  }

  return {
    isModalOpen,
    isRequiringSteamGuard,
    isSubmitting,
    refInputSteamGuard,
    refInputAccountName,
    requiredSteamGuardAccounts,
    formStep,
    form,
    requireSteamGuard,
    resetForm,
    closeModal,
    openModal,
    completeForm,
    goBackToCredentials,
  }
}

export async function httpCreateSteamAccount(
  payload: CreateSteamAccountPayload,
  getAPI: () => Promise<AxiosInstance>
): Promise<DataOrError<string>> {
  await new Promise(res => setTimeout(res, 1000))
  return [new ApplicationError("Erro desconhecido.", 500), null]

  const api = await getAPI()
  const response = await api.post<any, AxiosResponse<AddSteamAccountOutput>, CreateSteamAccountPayload>(
    "/steam-accounts",
    payload
  )
  if (response.status === 202) return [new ApplicationError("Steam Guard needed.", 202), null]
  if (response.data.steamAccountID) return [null, response.data.steamAccountID]
  return [new ApplicationError("Erro desconhecido.", 500), null]
}

type CreateSteamAccountPayload = {
  accountName: string
  password: string
  authCode?: string
}

export type DefaultErrorHTTP = {
  message: string
}

export function isResponseOK(status: number) {
  return status >= 200 && status <= 299
}
