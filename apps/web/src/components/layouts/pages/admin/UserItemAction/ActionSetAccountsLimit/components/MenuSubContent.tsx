import { IconPlus } from "@/components/icons/IconPlus"
import { IconSpinner } from "@/components/icons/IconSpinner"
import { useUserAdminItemId } from "@/components/layouts/pages/admin/UserItemAction/context"
import { DropdownMenuSubContent } from "@/components/ui/dropdown-menu"
import { api } from "@/lib/axios"
import { ECacheKeys } from "@/mutations/queryKeys"
import { useAuth } from "@clerk/clerk-react"
import React, { useState } from "react"
import { toast } from "sonner"
import twc from "tailwindcss/colors"
import { useUserAdminListItem } from "../../../hooks/useUserAdminListItem"
import { isMutationPending } from "../../ActionSetGamesLimit/components/MenuSubContent"
import {
  ActionSelect,
  ActionSelectContent,
  ActionSelectItem,
  ActionSelectTrigger,
  ActionSelectValue,
  HoverCard,
  Pieces,
} from "../../components"
import { useUserAdminActionSetAccounts } from "../mutation"

export type ActionSetAccountsLimitMenuSubContentProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuSubContent
> & {
  render: React.FC<{ isSure: boolean; setIsSure: React.Dispatch<React.SetStateAction<boolean>> }>
}

export const ActionSetAccountsLimitMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuSubContent>,
  ActionSetAccountsLimitMenuSubContentProps
>(function ActionSetAccountsLimitMenuSubContentComponent({ render, ...props }, ref) {
  const userId = useUserAdminItemId()
  const maxSteamAccounts = useUserAdminListItem(userId, user => user.plan.maxSteamAccounts)
  const [isSure, setIsSure] = useState(false)
  const [inputValueMaxAccounts, setInputValueMaxAccounts] = useState(maxSteamAccounts)
  const isDirty = maxSteamAccounts !== inputValueMaxAccounts
  const isPending = isMutationPending(ECacheKeys.setAccounts)

  const { getToken } = useAuth()
  const getAPI = async () => {
    api.defaults.headers["Authorization"] = `Bearer ${await getToken()}`
    return api
  }

  const mutationSetAccounts = useUserAdminActionSetAccounts(getAPI)

  const handleClick = () => {
    if (!isSure && inputValueMaxAccounts === maxSteamAccounts) return
    setIsSure(s => !s)

    if (isSure) {
      mutationSetAccounts.mutate(
        {
          newAccountsLimit: inputValueMaxAccounts,
          userId,
        },
        {
          onSuccess([undesired, message], { newAccountsLimit }) {
            if (undesired) {
              toast[undesired.type](undesired.message)
              return
            }
            toast.success(message)
            console.log(`accounts set to [${newAccountsLimit}]`)
          },
        }
      )
    }
  }

  const handleOnChange = (newValue: string) => {
    const value = parseInt(newValue)
    if (value !== inputValueMaxAccounts) setIsSure(false)
    setInputValueMaxAccounts(value)
  }

  return (
    <Pieces.Container
      {...props}
      ref={ref}
    >
      <Pieces.Header>
        <Pieces.HeaderTitle>Máximo de contas:</Pieces.HeaderTitle>
        <Pieces.HeaderSubjectAmount>{maxSteamAccounts}</Pieces.HeaderSubjectAmount>
      </Pieces.Header>
      {/* <div className="pt-2" /> */}
      {isDirty && (
        <Pieces.ThinMiddle>
          <span className="text-[10px]/none text-amber-500">Alterado</span>
        </Pieces.ThinMiddle>
      )}
      <Pieces.Footer>
        <ActionSelect
          value={inputValueMaxAccounts.toString()}
          onValueChange={handleOnChange}
        >
          <ActionSelectTrigger>
            <ActionSelectValue placeholder="Novo máx. de contas" />
          </ActionSelectTrigger>
          <ActionSelectContent>
            {options.map(opt => (
              <ActionSelectItem
                key={opt.value}
                data-selected={maxSteamAccounts === opt.value}
                value={opt.value.toString()}
              >
                {opt.text}
              </ActionSelectItem>
            ))}
          </ActionSelectContent>
        </ActionSelect>

        {isPending && (
          <Pieces.Loading>
            <IconSpinner
              color={twc.slate["200"]}
              className="size-3 animate-pulse"
            />
          </Pieces.Loading>
        )}
        {!isPending && (
          <Pieces.Trigger onClick={handleClick}>
            {!isSure && <IconPlus className="size-3 text-white" />}
            {isSure && render({ isSure, setIsSure })}
            <HoverCard data-open={isSure}>
              <p>- Máximo de contas -</p>
              <p className="bg-accent border-accent-500 mt-1 rounded-md border px-2 py-1 text-sm/none tabular-nums">
                De <strong>{maxSteamAccounts}</strong> para <strong>{inputValueMaxAccounts}</strong>
              </p>
              <span className="mt-1 text-xs text-slate-500">Tem certeza que deseja fazer alteração?</span>
            </HoverCard>
          </Pieces.Trigger>
        )}
      </Pieces.Footer>
    </Pieces.Container>
  )
})

ActionSetAccountsLimitMenuSubContent.displayName = "ActionSetAccountsLimitMenuSubContent"

const options = Array.from({ length: 2 }).map((_, i) => ({
  value: ++i,
  text: `${i} contas`,
}))
