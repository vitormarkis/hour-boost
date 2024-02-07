import { Slot } from "@radix-ui/react-slot"
import { PropsWithChildren } from "react"

export const CommandTrigger: React.FC<PropsWithChildren & { value: number }> = ({ children, value }) => {
  throw new Error("CommandTrigger.useUserAdminStore")

  return (
    <Slot
      onClick={() => {
        // addMoreHours(value)
        console.log("adding ", value)
        console.log("adicionando mais horas")
      }}
    >
      {children}
    </Slot>
  )
}
