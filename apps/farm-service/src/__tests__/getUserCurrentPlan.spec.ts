import { GuestPlan } from "core"
import { getUserCurrentPlan } from "~/utils"

describe("getUserCurrentPlan util function test suite", () => {
  test("should assign guest plan", async () => {
    const userPlan = getUserCurrentPlan(
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

  test("should throw when there is a missmatch between type and plan name", async () => {
    expect(() => {
      getUserCurrentPlan(
        {
          createdAt: new Date("2023-06-20T10:00:00"),
          id_plan: "123",
          name: "GUEST",
          ownerId: "abc",
          type: "INFINITY",
          usages: [],
        },
        "abc"
      )
    }).toThrow("Invalid plan assignment")
  })

  test("should throw when invalid name is provided", async () => {
    expect(() => {
      getUserCurrentPlan(
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
    }).toThrow("Invalid plan assignment")
  })

  test("should throw when invalid type is provided", async () => {
    expect(() => {
      getUserCurrentPlan(
        {
          createdAt: new Date("2023-06-20T10:00:00"),
          id_plan: "123",
          name: "GUEST",
          ownerId: "abc",
          // @ts-ignore
          type: "random",
          usages: [],
        },
        "abc"
      )
    }).toThrow("Invalid plan data from database")
  })
})
