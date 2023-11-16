import React, { useEffect, useRef, useState } from "react"
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
import {
  AddSteamAccountInput,
  AddSteamAccountOutput,
  IAddSteamAccount,
  SteamAccount,
  UserSession,
} from "core"
import { useAuth } from "@clerk/clerk-react"
import { api } from "@/lib/axios"
import { AxiosError, AxiosInstance, AxiosResponse } from "axios"
import { DefaultError, useMutation, useQueryClient } from "@tanstack/react-query"
import FlipMove from "react-flip-move"
import twc from "tailwindcss/colors"

export type ModalAddSteamAccountProps = React.ComponentPropsWithoutRef<typeof DialogContent> & {
  children: React.ReactNode
  userId: UserSession["id_user"]
}

export const ModalAddSteamAccount = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  ModalAddSteamAccountProps
>(function ModalAddSteamAccountComponent({ userId, children, className, ...props }, ref) {
  const { getToken } = useAuth()
  const getAPI = async () => {
    api.defaults.headers["Authorization"] = `Bearer ${await getToken()}`
    return api
  }
  const s = useStater()
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
      s.closeModal()
    },
    onError: error => {
      alert(error.message)
    },
  })

  const handleCredentials = async () => {
    s.form.steps["CREDENTIALS"].submit()
    await new Promise(res =>
      setTimeout(() => {
        res(true)
        s.requireSteamGuard()
      }, 4500)
    )
    s.refInputSteamGuard.current?.focus()
    s.form.steps["CREDENTIALS"].resolveSubmit()
  }

  const handleSteamGuard = async () => {
    s.form.steps["STEAM-GUARD"].submit()
    await new Promise(res =>
      setTimeout(() => {
        res(true)
        alert("Login com sucesso")
      }, 2700)
    )
    s.form.steps["STEAM-GUARD"].resolveSubmit()
    s.completeForm()
  }

  const handleSubmit = async () => {
    if (s.formStep === "CREDENTIALS") await handleCredentials()
    if (s.formStep === "STEAM-GUARD") await handleSteamGuard()
    return
    // createSteamAccount({ accountName, password })
  }

  return (
    <Dialog
      open={s.isModalOpen}
      onOpenChange={isOpen => (isOpen ? s.openModal() : s.closeModal())}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        {...props}
        className={cn("border-slate-900", className)}
        ref={ref}
      >
        {/* <pre>
          {JSON.stringify(
            {
              requiredSteamGuardUsers: s.requiredSteamGuardAccounts,
              isSubmitting: s.isSubmitting,
              formState: s.formStep,
            },
            null,
            2
          )}
        </pre> */}
        <DialogHeader>
          <DialogTitle>Adicionar conta Steam</DialogTitle>
          <DialogDescription className="pb-4">
            Para adicionar uma nova conta da Steam ao seu dashboard, preencha os campos abaixo e clique em
            enviar. Caso seu login peça <strong>Steam Guard</strong>, preencha o campo e submeta novamente.
          </DialogDescription>
        </DialogHeader>
        <div className="pb-4">
          <FlipMove
            easing="ease"
            enterAnimation="fade"
            leaveAnimation="fade"
            staggerDelayBy={100}
            staggerDurationBy={100}
            duration={500}
            maintainContainerHeight
          >
            <div className="pb-1">
              <Label
                data-disabled={s.isRequiringSteamGuard}
                className="data-[disabled=true]:text-slate-500"
              >
                Nome da conta
              </Label>
              <Input
                value={s.inputStates.accountName}
                onChange={e => s.inputStates.setAccountName(e.target.value)}
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
                value={s.inputStates.password}
                onChange={e => s.inputStates.setPassword(e.target.value)}
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
                      onClick={s.cancelAddSteamGuard}
                      className="underline text-xs cursor-pointer font-medium text-accent"
                    >
                      Voltar
                    </strong>
                  </div>
                  <Input
                    ref={s.refInputSteamGuard}
                    value={s.inputStates.steamGuard}
                    onChange={e => s.inputStates.setSteamGuard(e.target.value)}
                    placeholder="JS82K9"
                    autoFocus
                  />
                </div>
              </div>
            )}
          </FlipMove>
        </div>
        <Button
          disabled={s.isSubmitting}
          onClick={handleSubmit}
          className="relative"
        >
          {s.isSubmitting
            ? s.form.steps[s.formStep].textSubmittingButton
            : s.form.steps[s.formStep].textSubmitButton}
          {s.isSubmitting && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <SVGSpinner className="h-5 w-5" />
            </div>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
})

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

export function useStater() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [accountName, setAccountName] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [steamGuard, setSteamGuard] = React.useState("")

  // const [isRequiringSteamGuard, setIsRequiringSteamGuard] = useState(false)
  const [formStep, setFormStep] = useState<FormStep>("CREDENTIALS")
  const [requiredSteamGuardAccounts, setRequiredSteamGuardAccounts] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const refInputSteamGuard = useRef<HTMLInputElement | null>(null)
  const refInputAccountName = useRef<HTMLInputElement | null>(null)
  const requireSteamGuard = () => {
    setFormStep("STEAM-GUARD")
    setRequiredSteamGuardAccounts(an => (an.includes(accountName) ? an : [...an, accountName]))
  }
  const resetFormFields = () => {
    setAccountName("")
    setPassword("")
    setSteamGuard("")
  }
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
  const cancelAddSteamGuard = () => {
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
    requireSteamGuard,
    resetForm,
    closeModal,
    openModal,
    completeForm,
    form,
    cancelAddSteamGuard,
    inputStates: {
      accountName,
      setAccountName,
      password,
      setPassword,
      steamGuard,
      setSteamGuard,
    },
  }
}

export type SVGSpinnerProps = React.ComponentPropsWithoutRef<"svg">

export function SVGSpinner({ className, ...props }: SVGSpinnerProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      {...props}
      className={cn("animate-spin-r", className)}
    >
      <radialGradient
        id="a10"
        cx=".66"
        fx=".66"
        cy=".3125"
        fy=".3125"
        gradientTransform="scale(1.5)"
      >
        <stop
          offset={0}
          stopColor={twc.slate["800"]}
        />
        <stop
          offset=".3"
          stopColor={twc.slate["800"]}
          stopOpacity=".9"
        />
        <stop
          offset=".6"
          stopColor={twc.slate["800"]}
          stopOpacity=".6"
        />
        <stop
          offset=".8"
          stopColor={twc.slate["800"]}
          stopOpacity=".3"
        />
        <stop
          offset={1}
          stopColor={twc.slate["800"]}
          stopOpacity={0}
        />
      </radialGradient>
      <circle
        transform-origin="center"
        fill="none"
        stroke="url(#a10)"
        strokeWidth={30}
        strokeLinecap="round"
        strokeDasharray="200 1000"
        strokeDashoffset={0}
        cx={100}
        cy={100}
        r={70}
      />
      <circle
        transform-origin="center"
        fill="none"
        opacity=".2"
        stroke={twc.slate["800"]}
        strokeWidth={30}
        strokeLinecap="round"
        cx={100}
        cy={100}
        r={70}
      />
    </svg>
  )
}

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
