import { IconChevron } from "@/components/icons/IconChevron"
import { IconCircleDollar } from "@/components/icons/IconCircleDollar"
import { IconUserCycle } from "@/components/icons/IconUserCycle"
import { IconUserX } from "@/components/icons/IconUserX"
import { BadgePlanType } from "@/components/layouts/UserPlanStatus/components"
import { cn } from "@/lib/utils"
import { ECacheKeys } from "@/mutations/queryKeys"
import { getPlanName } from "@/util/getPlanName"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion"
import React from "react"
import { AlertDialogBanUser } from "../BanUser/components/alert-dialog"
import { AlertDialogUnbanUser } from "../UnbanUser/components/alert-dialog"
import { isMutationPending } from "../UserItemAction/ActionSetGamesLimit/components/MenuSubContent"
import { UserItemActionMenuDropdown } from "../UserItemAction/MenuDropdown"
import { UserAdminIdProvider, useUserAdminItemId } from "../UserItemAction/context"
import { ModalSeeUserPurchases } from "../UserPurchases"
import { useUserAdminListItem } from "../hooks/useUserAdminListItem"
import { AdminUserItemProfilePicture } from "./AdminUserItemProfilePicture"
import { SteamAccountAdminList } from "./SteamAccountAdminList"

export type UserAdminItemListItemProps = {
  userId: string
}

export function UserAdminItemListItem({ userId }: UserAdminItemListItemProps) {
  const planNameDomain = useUserAdminListItem(userId, user => user.plan.name)
  const status = useUserAdminListItem(userId, user => user.status)
  const isBanned = React.useMemo(() => status === "BANNED", [status])
  const isUnbanningUser = false
  // const isUnbanningUser = isMutationPending(ECacheKeys.unbanUser(userId))

  const planName = getPlanName(planNameDomain)

  return (
    <UserAdminIdProvider userId={userId}>
      <Accordion type="multiple">
        <AccordionItem value={userId}>
          <div className="h-20 flex items-center bg-black/10 hover:bg-slate-900/50 cursor-pointer">
            <AdminUserItemProfilePicture />
            <div className="pl-4 w-[13rem] shrink-0">
              <AdminUserItemUsername />
            </div>
            <div className="px-4">
              <div className="w-20 flex justify-center">
                <BadgePlanType name={planNameDomain}>{planName}</BadgePlanType>
              </div>
            </div>
            <div className="pl-4 h-full grid place-items-center">
              <UserItemActionMenuDropdown preventDefault={isBanned}>
                <button
                  disabled={isBanned}
                  className="flex items-center gap-2 h-full pl-8 pr-6 text-sm hover:bg-slate-800/50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span>Ações</span>
                  <IconChevron className="size-3" />
                </button>
              </UserItemActionMenuDropdown>
            </div>
            <AccordionTrigger className="bg-slate-900 h-full w-full" />
            <div className="h-full flex ml-auto">
              <div className="h-full flex">
                <ModalSeeUserPurchases>
                  <button className="w-[3.5rem] justify-center flex items-center gap-2 h-full px-4 text-sm hover:bg-slate-800/50">
                    <IconCircleDollar className="size-5" />
                  </button>
                </ModalSeeUserPurchases>
                {!isBanned && (
                  <AlertDialogBanUser>
                    <button className="w-[3.5rem] justify-center flex items-center gap-2 h-full px-4 text-sm hover:bg-slate-800/50">
                      <IconUserX className="size-5" />
                    </button>
                  </AlertDialogBanUser>
                )}
                {isBanned && (
                  <AlertDialogUnbanUser>
                    <button className="w-[3.5rem] justify-center flex items-center gap-2 h-full px-4 text-sm hover:bg-slate-800/50">
                      <IconUserCycle
                        className={cn("size-6 text-emerald-300", isUnbanningUser && "animate-spin")}
                      />
                    </button>
                  </AlertDialogUnbanUser>
                )}
                {/* <button className="flex items-center gap-2 h-full px-4 text-sm hover:bg-slate-800/50">
                  <IconUserMinus className="size-5" />
                </button> */}
              </div>
            </div>
          </div>
          <AccordionContent className="[--container-height:3rem]">
            <SteamAccountAdminList />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </UserAdminIdProvider>
  )
}

UserAdminItemListItem.displayName = "UserAdminItemListItem"

export type AdminUserItemUsernameProps = React.ComponentPropsWithoutRef<"strong"> & {}

export const AdminUserItemUsername = React.forwardRef<React.ElementRef<"strong">, AdminUserItemUsernameProps>(
  function AdminUserItemUsernameComponent({ className, ...props }, ref) {
    const userId = useUserAdminItemId()
    const username = useUserAdminListItem(userId, user => user.username)
    const status = useUserAdminListItem(userId, user => user.status)
    const isBanned = React.useMemo(() => status === "BANNED", [status])

    return (
      <strong
        {...props}
        className={cn("text-lg font-medium", isBanned && "text-slate-500")}
        ref={ref}
      >
        {username}
      </strong>
    )
  }
)

AdminUserItemUsername.displayName = "AdminUserItemUsername"
