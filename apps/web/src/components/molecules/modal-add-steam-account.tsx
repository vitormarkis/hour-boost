import React from "react"
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
import { AddSteamAccountInput, AddSteamAccountOutput, IAddSteamAccount } from "core"
import { useAuth } from "@clerk/clerk-react"

export type ModalAddSteamAccountProps = React.ComponentPropsWithoutRef<typeof DialogContent> & {
  children: React.ReactNode
}

export const ModalAddSteamAccount = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  ModalAddSteamAccountProps
>(function ModalAddSteamAccountComponent({ children, className, ...props }, ref) {
  const [accountName, setAccountName] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [responseData, setResponseData] = React.useState<AddSteamAccountOutput | null>(null)
  const { getToken } = useAuth()

  const handleSubmit = async () => {
    const response = await fetch("http://localhost:3309/steam-accounts", {
      method: "POST",
      body: JSON.stringify({
        accountName,
        password,
      } as IAddSteamAccount),
      headers: {
        Authorization: `Bearer ${await getToken()}`,
        "Content-type": "application/json",
      },
    })
    const data = (await response.json()) as AddSteamAccountOutput
    setResponseData(data)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        {...props}
        className={cn("", className)}
        ref={ref}
      >
        <pre>{JSON.stringify({ responseData }, null, 2)}</pre>
        <DialogHeader>
          <DialogTitle>Adicionar conta Steam</DialogTitle>
          <DialogDescription>
            texto para adição de conta da steam texto para adição de conta da steam texto para adição de conta
            da steam
          </DialogDescription>
          <Label>Account Name</Label>
          <Input
            value={accountName}
            onChange={e => setAccountName(e.target.value)}
            placeholder="Account name..."
          />
          <Label>Password</Label>
          <Input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            placeholder="Password..."
          />
          <Button onClick={handleSubmit}>Enviar</Button>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
})

ModalAddSteamAccount.displayName = "ModalAddSteamAccount"
