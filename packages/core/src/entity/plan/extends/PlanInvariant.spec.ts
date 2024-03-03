import { Plan } from "core/entity/plan/Plan"
import { PlanUsage } from "core/entity/plan/PlanUsage"
import { Usage } from "core/entity/plan/Usage"
import { UsageList } from "core/entity/plan/UsageList"
import { GuestPlan } from "core/entity/plan/extends/PlanGuest"

class ExamplePlan extends Plan {
  constructor(...args: ConstructorParameters<typeof Plan>) {
    super(...args)
  }

  use(usage: Usage): void {}
}

test("should throw if mismatch between plan guest and a plan type", async () => {
  expect(
    () =>
      new ExamplePlan({
        autoRestarter: false,
        id_plan: "123",
        maxGamesAllowed: 32,
        maxSteamAccounts: 2,
        name: "GUEST",
        ownerId: "owner_id",
        price: 2000,
        status: "IDDLE",
        type: "INFINITY",
        usages: new UsageList(),
      })
  ).toThrow("Invariant! Mismatch entre o tipo do plano e o nome")
})

test("should throw if mismatch between plan custom infinity and a plan type", async () => {
  expect(
    () =>
      new ExamplePlan({
        autoRestarter: false,
        id_plan: "123",
        maxGamesAllowed: 32,
        maxSteamAccounts: 2,
        name: "INFINITY-CUSTOM",
        ownerId: "owner_id",
        price: 2000,
        status: "IDDLE",
        type: "USAGE",
        usages: new UsageList(),
      })
  ).toThrow("Invariant! Mismatch entre o tipo do plano e o nome")
})

test("should NOT throw if plan custom infinity and a plan type matches", async () => {
  const plan = new ExamplePlan({
    autoRestarter: false,
    id_plan: "123",
    maxGamesAllowed: 32,
    maxSteamAccounts: 2,
    name: "INFINITY-CUSTOM",
    ownerId: "owner_id",
    price: 2000,
    status: "IDDLE",
    type: "INFINITY",
    usages: new UsageList(),
  })

  expect(plan.name).toBe("INFINITY-CUSTOM")
})
