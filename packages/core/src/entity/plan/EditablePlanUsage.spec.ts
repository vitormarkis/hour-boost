import { EditablePlan } from "core/entity/plan/EditablePlan"
import { EditablePlanUsage } from "core/entity/plan/EditablePlanUsage"
import { GuestPlan } from "core/entity/plan/extends"

test("should add more usage time", async () => {
  const plan = GuestPlan.create({
    ownerId: "",
  })
  expect(plan.getUsageLeft()).toBe(21600)

  const editablePlan = new EditablePlanUsage(plan, new EditablePlan(plan))
  editablePlan.addMoreUsageTime(400)
  expect(plan.getUsageLeft()).toBe(22000)
  expect(plan.custom).toBe(true)
})
