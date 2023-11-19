import { ActiveStatus, GuestPlan, PlanInfinity, PlanUsage, User, UserRole } from "core"

export const makeUser = (userId: string, username: string, plan?: PlanUsage | PlanInfinity): User => {
  return User.restore({
    id_user: userId,
    email: "",
    plan:
      plan ??
      GuestPlan.create({
        ownerId: userId,
      }),
    profilePic: "",
    purchases: [],
    role: new UserRole(),
    status: new ActiveStatus(),
    steamAccounts: [],
    username: username,
  })
}
