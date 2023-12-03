import React from "react"
import { cn } from "@/lib/utils"
import { HeaderStructure } from "@/components/layouts/Header/header-structure"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MenuDropdownUserHeader } from "@/components/molecules/menu-dropdown-user-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserSession } from "core"
import { getUserInitials } from "@/util/getUserInitials"
import { RoleName } from "core"

export type HeaderDashboardProps = Omit<
	React.ComponentPropsWithoutRef<typeof HeaderStructure>,
	"children"
> & {
	user: UserSession
}

export const HeaderDashboard = React.forwardRef<
	React.ElementRef<typeof HeaderStructure>,
	HeaderDashboardProps
>(function HeaderDashboardComponent({ user, className, ...props }, ref) {
	const userInitials = getUserInitials(user)

	return (
		<HeaderStructure {...props} className={cn("gap-8", className)} ref={ref}>
			<div className="flex-1 h-full flex gap-4 items-center"></div>
			<div className="h-full flex gap-4 items-center">
				<RoleBadge role={user.role} />
				<div className="flex items-center gap-2 text-sm">
					<span className="font-semibold">Status:</span>
					<span className="leading-none py-1 px-2 rounded-md bg-green-400/70">{user.status}</span>
				</div>
			</div>
			<div className="h-full flex gap-4 items-center">
				<MenuDropdownUserHeader>
					<Avatar className="h-7 w-7">
						<AvatarImage src={user.profilePic} />
						<AvatarFallback>{userInitials}</AvatarFallback>
					</Avatar>
				</MenuDropdownUserHeader>
			</div>
		</HeaderStructure>
	)
})

export type RoleBadgeProps = React.ComponentPropsWithoutRef<"div"> & {
	role: RoleName
}

export const RoleBadge = React.forwardRef<React.ElementRef<"div">, RoleBadgeProps>(
	function RoleBadgeComponent({ role, className, ...props }, ref) {
		return (
			<div {...props} className={cn("flex items-center gap-2 text-sm", className)} ref={ref}>
				<span className="font-semibold">Cargo:</span>
				<span
					className={cn("leading-none py-1 px-2 rounded-md bg-indigo-600", {
						"bg-lime-500/90": role === "ADMIN",
					})}
				>
					{role}
				</span>
			</div>
		)
	}
)

RoleBadge.displayName = "RoleBadge"

HeaderDashboard.displayName = "HeaderDashboard"
