import { Slot } from "@radix-ui/react-slot"
import { PropsWithChildren } from "react"

export const CommandTrigger: React.FC<PropsWithChildren & { value: number }> = ({ children, value }) => {
  throw new Error("CommandTrigger.useUserAdminStore")

  return (
    <Slot
      onClick={() => {
        // addMoreHours(value)
      }}
    >
      {children}
    </Slot>
  )
}
