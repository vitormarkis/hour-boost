import z from "zod"

export const formSchema = z.object({
  accountName: z.string().min(1, "Este campo é obrigatório.").max(40, "Nome de conta muito grande."),
  password: z.string().min(1, "Este campo é obrigatório.").max(40, "Senha muito grande."),
  authCode: z.string().length(6, "O código steam guard possui 6 dígitos.").or(z.literal("")),
})

export type FormType = z.infer<typeof formSchema>
