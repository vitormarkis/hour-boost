import { AuthSession } from "@/types/UserSession"

export function getUserInitials(user: AuthSession["user"]) {
  if (!user) return "HB"
  const a = user.firstName ? user.firstName.at(0) : user.username?.at(0)
  const b = user.lastName ? user.lastName.at(0) : user.username?.at(1)
  if (!a || !b) return "HB"
  return a + b
}
