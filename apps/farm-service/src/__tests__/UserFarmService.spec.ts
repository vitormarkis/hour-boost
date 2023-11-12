import { Publisher } from "../infra/queue"
import { FARMING_INTERVAL_IN_SECONDS, UserFarmService } from "../domain/service/UserFarmService"
import { PlanUsage, SilverPlan, User } from "core"

const publisher = new Publisher()
const SIX_HOURS_IN_SECONDS = 21600
let userFarmService: UserFarmService
let user: User

beforeEach(() => {
  user = User.create({
    email: "json@mail.com",
    id_user: "123",
    username: "jsonwebtoken",
  })
  userFarmService = new UserFarmService(publisher, user)
  jest.useFakeTimers()
})

afterAll(() => {
  jest.useRealTimers()
})

describe("UserFarmService test suite", () => {
  test("should throw when plan infinity attemps to use the service", async () => {
    const user = User.create({
      email: "json@mail.com",
      id_user: "123",
      username: "jsonwebtoken",
    })

    user.assignPlan(
      SilverPlan.create({
        ownerId: user.id_user,
      })
    )

    const userFarmService = new UserFarmService(publisher, user)
    expect(() => {
      userFarmService.startFarm()
    }).toThrow()
  })

  test("should start with status iddle", async () => {
    if (!(user.plan instanceof PlanUsage)) throw new Error()
    expect(userFarmService.status).toBe("IDDLE")
  })

  test("should set status to farming once user start farming", async () => {
    if (!(user.plan instanceof PlanUsage)) throw new Error()
    userFarmService.startFarm()
    expect(userFarmService.status).toBe("FARMING")
  })

  test("should set status to iddle again once user stop farming", async () => {
    if (!(user.plan instanceof PlanUsage)) throw new Error()
    userFarmService.startFarm()
    jest.advanceTimersByTime(FARMING_INTERVAL_IN_SECONDS * 1000)
    userFarmService.stopFarm()
    expect(userFarmService.status).toBe("IDDLE")
  })

  test("should decrement user plan as user farms", async () => {
    if (!(user.plan instanceof PlanUsage)) throw new Error()
    userFarmService.startFarm()
    user.plan.getUsageLeft()
    expect(user.plan.getUsageLeft()).toBe(21600)
    jest.advanceTimersByTime(FARMING_INTERVAL_IN_SECONDS * 1000)
    userFarmService.stopFarm()
    expect(user.plan.getUsageLeft()).toBe(21600 - FARMING_INTERVAL_IN_SECONDS) // guest plan max usage
  })

  test("should empty the user plan usage left when uses all plan usage", async () => {
    if (!(user.plan instanceof PlanUsage)) throw new Error()
    userFarmService.startFarm()
    expect(user.plan.getUsageLeft()).toBe(SIX_HOURS_IN_SECONDS) // 6 hours in seconds
    jest.advanceTimersByTime(1000 * SIX_HOURS_IN_SECONDS) // 6 hours farmed
    userFarmService.stopFarm()
    expect(user.plan.getUsageLeft()).toBe(0)
  })

  test("should throw error when farming interval exceeds maximum plan's usage left", async () => {
    if (!(user.plan instanceof PlanUsage)) throw new Error()
    userFarmService.startFarm()
    expect(user.plan.getUsageLeft()).toBe(SIX_HOURS_IN_SECONDS)
    expect(() => {
      jest.advanceTimersByTime(1000 * SIX_HOURS_IN_SECONDS + 1000 * SIX_HOURS_IN_SECONDS)
    }).toThrow("Usos do plano acabaram!")
    expect(user.plan.getUsageLeft()).toBe(0)
    expect(user.plan.usages).toHaveLength(1)
    expect(user.plan.usages[0].amountTime).toBe(SIX_HOURS_IN_SECONDS)
  })
})
