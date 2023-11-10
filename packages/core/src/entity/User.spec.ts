import { User } from "./User"
import { GuestPlan } from "./plan/PlanGuest"
import { SilverPlan } from "./plan/PlanSilver"
import { UserRole } from "./role/UserRole"
import { ActiveStatus } from "./status/ActiveStatus"
import { makeID } from "./generateID"

test("should create user with default values", async () => {
  const user = User.create({
    id_user: makeID(),
    username: "vitormarkis",
    email: "vitormarkis@mail.com",
    profilePic: "https://photo.com",
  })
  expect(user).toHaveProperty("username")
  expect(user).toHaveProperty("id_user")
  expect(user).toHaveProperty("id_user")
  expect(user).toHaveProperty("email")
  expect(user).toHaveProperty("username")
  expect(user).toHaveProperty("profilePic")
  expect(user).toHaveProperty("steamAccounts")
  expect(user).toHaveProperty("plan")
  expect(user).toHaveProperty("role")
  expect(user).toHaveProperty("status")
  expect(user).toHaveProperty("purchases")
})

test("should restore user with default values", async () => {
  const user = User.restore({
    username: "vitormarkis",
    email: "vitormarkis@mail.com",
    profilePic: "https://photo.com",
    id_user: "123456789",
    plan: GuestPlan.create({
      ownerId: "123456789",
    }),
    purchases: [],
    role: new UserRole(),
    status: new ActiveStatus(),
    steamAccounts: [],
  })
  expect(user).toHaveProperty("username")
  expect(user).toHaveProperty("id_user")
  expect(user).toHaveProperty("id_user")
  expect(user).toHaveProperty("email")
  expect(user).toHaveProperty("username")
  expect(user).toHaveProperty("profilePic")
  expect(user).toHaveProperty("steamAccounts")
  expect(user).toHaveProperty("plan")
  expect(user).toHaveProperty("role")
  expect(user).toHaveProperty("status")
  expect(user).toHaveProperty("purchases")

  expect(user.role.name).toBe("USER")
  expect(user.status.name).toBe("ACTIVE")
  expect(user.purchases).toHaveLength(0)
})

test("should assign a new plan", async () => {
  const id_user = makeID()

  const user = User.create({
    id_user,
    username: "vitormarkis",
    email: "vitormarkis@mail.com",
    profilePic: "https://photo.com",
  })
  expect(user.plan).toBeInstanceOf(GuestPlan)
  user.assignPlan(
    SilverPlan.create({
      ownerId: id_user,
    })
  )
  expect(user.plan).toBeInstanceOf(SilverPlan)
})
