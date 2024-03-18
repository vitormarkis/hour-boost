import { Plan } from "core/entity/plan/Plan"
import { Usage } from "core/entity/plan/Usage"
import { UsageList } from "core/entity/plan/UsageList"

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
        custom: false,
      })
  ).toThrow("Invariant! Mismatch entre o tipo do plano e o nome")
})
