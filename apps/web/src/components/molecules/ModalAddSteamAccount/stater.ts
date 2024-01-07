import { useRef, useState } from "react"
import { FormType } from "./form"

export function useStater(
  accountName: string,
  resetAllFields: () => void,
  clearField: (field: keyof FormType) => void
) {
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
    clearField("authCode")
    setTimeout(() => refInputAccountName.current?.focus(), 0)
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

type FormStep = "CREDENTIALS" | "STEAM-GUARD"

export interface IFormController {
  submit(): void
  resolveSubmit(): void
  textSubmitButton: string
  textSubmittingButton: string
}

export type IFormSteps = Record<FormStep, IFormController>
