import { EditablePlan } from "core/entity/plan/EditablePlan"
import { EditablePlanInfinity } from "core/entity/plan/EditablePlanInfinity"
import { SilverPlan } from "core/entity/plan/extends"

test("should set new max games allowed", async () => {
  const plan = SilverPlan.create({
    ownerId: "",
  })
  expect(plan.maxGamesAllowed).toBe(1)

  const editablePlan = new EditablePlanInfinity(new EditablePlan(plan))
  editablePlan.setMaxGamesAmount(32)
  expect(plan.maxGamesAllowed).toBe(32)
  expect(plan.custom).toBe(true)
})

test("should set new max accounts allowed", async () => {
  const plan = SilverPlan.create({
    ownerId: "",
  })
  expect(plan.maxSteamAccounts).toBe(1)

  const editablePlan = new EditablePlanInfinity(new EditablePlan(plan))
  editablePlan.setMaxAccountsAmount(2)
  expect(plan.maxSteamAccounts).toBe(2)
  expect(plan.custom).toBe(true)
})
