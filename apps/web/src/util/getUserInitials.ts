import { UserSession } from "core"

export function getUserInitials(user: UserSession | null) {
	if (!user || !user.username) return "HB"
	const a = user.username.at(0)
	const b = user.username.at(-1)
	if (!a || !b) return "HB"
	return a + b
}
