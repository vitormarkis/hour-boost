import { IconChevron } from "@/components/icons/IconChevron"
import { IconCircleDollar } from "@/components/icons/IconCircleDollar"
import { IconUserX } from "@/components/icons/IconUserX"
import { UserAdminPanelSession } from "@/pages/admin"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion"
import _ from "lodash"
import { memo } from "react"
import { AlertDialogBanUser } from "../UserBan/components/alert-dialog"
import { UserItemActionMenuDropdown } from "../UserItemAction/MenuDropdown"
import { UserAdminItemProvider } from "../UserItemAction/context"
import { ModalSeeUserPurchases } from "../UserPurchases"
import { cn } from "@/lib/utils"

export type UserAdminItemListProps = {
  user: UserAdminPanelSession
}

function UserAdminItemList({ user }: UserAdminItemListProps) {
  const isBanned = user.status === "BANNED"

  return (
    <UserAdminItemProvider value={user}>
      <Accordion
        type="single"
        collapsible
      >
        <AccordionItem value="item-1">
          <div className="h-14 flex items-center bg-black/10 hover:bg-slate-900/50 cursor-pointer">
            <div className="h-14 w-14 relative">
              <img
                src={user.profilePicture}
                // alt={`${user.username}'s profile picture.`}
                className={cn("h-full w-full absolute inset-0", isBanned && "opacity-50")}
              />
              <div className="inset-0 bg-black" />
              {isBanned && (
                <span className="flex items-center h-4 text-2xs px-1 bg-red-500 absolute left-0 top-0 -translate-y-1/2 -translate-x-2 z-30">
                  banido
                </span>
              )}
            </div>
            <div className="pl-4 w-[13rem]">
              <strong className={cn("font-medium", isBanned && "text-slate-500")}>{user.username}</strong>
            </div>
            <div className="pl-4">
              <div className="h-5 rounded flex items-center bg-sky-500 px-2">
                <span className="font-medium text-xs text-white">{user.plan.name}</span>
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
            <div className="h-full flex ml-auto">
              <div className="pl-4 h-full flex">
                <ModalSeeUserPurchases>
                  <button className="flex items-center gap-2 h-full px-4 text-sm hover:bg-slate-800/50">
                    <IconCircleDollar className="size-5" />
                  </button>
                </ModalSeeUserPurchases>
                <AlertDialogBanUser>
                  <button className="flex items-center gap-2 h-full px-4 text-sm hover:bg-slate-800/50">
                    <IconUserX className="size-5" />
                  </button>
                </AlertDialogBanUser>
                {/* <button className="flex items-center gap-2 h-full px-4 text-sm hover:bg-slate-800/50">
                  <IconUserMinus className="size-5" />
                </button> */}
              </div>
            </div>
            <AccordionTrigger />
          </div>
          <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </UserAdminItemProvider>
  )
}

UserAdminItemList.displayName = "UserAdminItemList"

const memoUserAdminItemList = memo(UserAdminItemList, (prevProps, nextProps) => {
  return _.isEqual(prevProps.user, nextProps.user)
})

export { memoUserAdminItemList as UserAdminItemList }
