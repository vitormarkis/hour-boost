import { Slot } from "@radix-ui/react-slot"
import { PropsWithChildren } from "react"

async function command() {
  await new Promise(res => setTimeout(res, 1000))
  console.log("adicionando mais jogos")
}

export const CommandTrigger: React.FC<PropsWithChildren> = ({ children }) => {
  return <Slot onClick={command}>{children}</Slot>
}
