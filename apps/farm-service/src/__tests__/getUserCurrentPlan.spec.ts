import { GuestPlan } from "core"
import { getCurrentPlanOrCreateOne } from "~/infra/mappers/databasePlanToDomain"

console.log = () => {}

describe("getUserCurrentPlan util function test suite", () => {
  test("should assign guest plan", async () => {
    const userPlan = getCurrentPlanOrCreateOne(
      {
        createdAt: new Date("2023-06-20T10:00:00"),
        id_plan: "123",
        name: "GUEST",
        ownerId: "abc",
        type: "USAGE",
        usages: [],
      },
      "abc"
    )

    expect(userPlan).toBeInstanceOf(GuestPlan)
  })

  test("should throw when invalid name is provided", async () => {
    expect(() => {
      getCurrentPlanOrCreateOne(
        {
          createdAt: new Date("2023-06-20T10:00:00"),
          id_plan: "123",
          // @ts-ignore
          name: "RANDOM",
          ownerId: "abc",
          type: "INFINITY",
          usages: [],
        },
        "abc"
      )
    }).toThrow("Invalid plan data from database")
  })
})
