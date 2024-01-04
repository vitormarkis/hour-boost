import { IconSpinner } from "@/components/icons/IconSpinner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseMutationResult } from "@tanstack/react-query"
import { DataOrError } from "core"
import React from "react"
import type { SubmitHandler, UseFormReturn } from "react-hook-form"
import { toast } from "sonner"
import { CreateSteamAccountPayload } from "./controller"
import { FormType } from "./form"
import { useStater } from "./stater"

export type ModalAddSteamAccountViewProps = {
  children: React.ReactNode
  createSteamAccount: UseMutationResult<DataOrError<string>, Error, CreateSteamAccountPayload, unknown>
  form: UseFormReturn<FormType>
  resetAllFields(): void
}

export const ModalAddSteamAccountView = React.forwardRef<
  React.ElementRef<"form">,
  ModalAddSteamAccountViewProps
>(function ModalAddSteamAccountViewComponent({ form, resetAllFields, createSteamAccount, children }, ref) {
  const s = useStater(form.watch("accountName"), resetAllFields)

  const handleCredentials = async (accountName: string, password: string) => {
    s.form.steps["CREDENTIALS"].submit()
    const [error, steamAccountId] = await createSteamAccount.mutateAsync({
      accountName,
      password,
    })
    s.form.steps["CREDENTIALS"].resolveSubmit()
    if (typeof steamAccountId === "string") {
      toast.success("Conta adicionada com sucesso.")
      s.closeModal()
      return
    }
    if (error.status == 202) {
      s.requireSteamGuard()
      return toast("Steam Guard requerido.")
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
      toast.success("Conta adicionada com sucesso.")
      return s.completeForm()
    }
    if (error.status == 202) {
      return toast("Steam Guard requerido.")
    }
    console.log(error, steamAccountId)
    toast("Erro desconhecido.")
  }

  const submitHandler: SubmitHandler<FormType> = async ({ accountName, authCode, password }) => {
    if (s.formStep === "CREDENTIALS") await handleCredentials(accountName, password)
    if (s.formStep === "STEAM-GUARD") await handleSteamGuard(accountName, password, authCode!)
    return
  }

  return (
    <Dialog
      open={s.isModalOpen}
      onOpenChange={isOpen => (isOpen ? s.openModal() : s.closeModal())}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form
            className="border-slate-900"
            onSubmit={form.handleSubmit(submitHandler)}
            ref={ref}
          >
            <pre>{JSON.stringify({ erros: form.formState.errors }, null, 2)}</pre>
            <DialogHeader>
              <DialogTitle>Adicionar conta Steam</DialogTitle>
              <DialogDescription className="pb-4">
                Para adicionar uma nova conta da Steam ao seu dashboard, preencha os campos abaixo e clique em
                enviar. Caso seu login peça <strong>Steam Guard</strong>, preencha o campo e submeta
                novamente.
              </DialogDescription>
            </DialogHeader>
            <div className="pb-5">
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
                <FormField
                  control={form.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        data-disabled={s.isRequiringSteamGuard}
                        className="data-[disabled=true]:text-slate-500"
                      >
                        Nome da conta
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="account name"
                          disabled={s.isRequiringSteamGuard}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="pb-1">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        data-disabled={s.isRequiringSteamGuard}
                        className="data-[disabled=true]:text-slate-500"
                      >
                        Senha
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="password"
                          type="password"
                          disabled={s.isRequiringSteamGuard}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {s.isRequiringSteamGuard && (
                <FormField
                  control={form.control}
                  name="authCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        data-disabled={s.isRequiringSteamGuard}
                        className="data-[disabled=true]:text-slate-500"
                      >
                        Código Steam Guard
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="HKS9LX"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {/* </FlipMove> */}
            </div>
            <Button
              // disabled={s.isSubmitting}
              type="submit"
              className="relative"
              onClick={() => console.log("enviar clicked")}
            >
              <span className="px-8">
                {s.isSubmitting
                  ? s.form.steps[s.formStep].textSubmittingButton
                  : s.form.steps[s.formStep].textSubmitButton}
              </span>
              {s.isSubmitting && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <IconSpinner className="h-5 w-5" />
                </div>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
})

ModalAddSteamAccountView.displayName = "ModalAddSteamAccountView"
