import z from "zod"

export const formSchema = z
  .object({
    accountName: z.string().min(1, "Este campo é obrigatório.").max(40, "Nome de conta muito grande."),
    password: z.string().min(1, "Este campo é obrigatório.").max(40, "Senha muito grande."),
    authCode: z.string().length(5, "O código steam guard possui 5 dígitos.").or(z.literal("")),
  })
  .transform(({ authCode, ...rest }) => {
    if (authCode == "") return { ...rest, authCode: undefined }
    return { authCode, ...rest }
  })

export type FormType = z.infer<typeof formSchema>
