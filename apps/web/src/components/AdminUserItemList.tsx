import { UserAdminPanelSession } from "@/pages/admin"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion"
import React, { memo } from "react"
import { IconChevron } from "./icons/IconChevron"
import { IconCircleDollar } from "./icons/IconCircleDollar"
import { IconUserMinus } from "./icons/IconUserMinus"
import { IconUserX } from "./icons/IconUserX"
import { UserItemActionMenuDropdown } from "./layouts/pages/admin/UserItemAction/MenuDropdown"
import { UserAdminItemProvider } from "./layouts/pages/admin/UserItemAction/context"
import _ from "lodash"
import { ModalSeeUserPurchases } from "./layouts/pages/admin/UserPurchases"

export type UserAdminItemListProps = {
  user: UserAdminPanelSession
}

function UserAdminItemList({ user }: UserAdminItemListProps) {
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
                className="h-full w-full absolute inset-0"
              />
            </div>
            <div className="pl-4 w-[13rem]">
              <strong className="font-medium">{user.username}</strong>
            </div>
            <div className="pl-4">
              <div className="h-5 rounded flex items-center bg-sky-500 px-2">
                <span className="font-medium text-xs text-white">{user.plan.name}</span>
              </div>
            </div>
            <div className="pl-4 h-full grid place-items-center">
              <UserItemActionMenuDropdown>
                <button className="flex items-center gap-2 h-full pl-8 pr-6 text-sm hover:bg-slate-800/50">
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
                <button className="flex items-center gap-2 h-full px-4 text-sm hover:bg-slate-800/50">
                  <IconUserMinus className="size-5" />
                </button>
                <button className="flex items-center gap-2 h-full px-4 text-sm hover:bg-slate-800/50">
                  <IconUserX className="size-5" />
                </button>
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
