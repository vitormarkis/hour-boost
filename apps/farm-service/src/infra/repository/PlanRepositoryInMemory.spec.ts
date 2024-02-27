import { Usage, User } from "core"
import { PlanRepositoryInMemory } from "./PlanRepositoryInMemory"
import { UsersInMemory } from "./UsersInMemory"

test("should change user plan", async () => {
  const user = User.create({
    email: "vitor@mail.com",
    id_user: "123_vitor",
    username: "vitor",
  })
  const usersMemory = new UsersInMemory()
  usersMemory.users.push(user)
  const planRepository = new PlanRepositoryInMemory(usersMemory)
  const plan = await planRepository.getById(user.plan.id_plan)
  expect(plan?.usages.data).toStrictEqual([])
  const usage = Usage.create({
    accountName: "acc_name",
    amountTime: 60,
    createdAt: new Date("2024-05-10"),
    plan_id: "123_plan",
    user_id: user.id_user,
  })
  plan?.use(usage)
  usersMemory.assignPlan(plan!)
  const plan2 = await planRepository.getById(user.plan.id_plan)
  expect(plan2?.usages.data).toHaveLength(1)
})
