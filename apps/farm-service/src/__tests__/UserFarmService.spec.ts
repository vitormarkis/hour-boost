import { FARMING_INTERVAL_IN_SECONDS, UserFarmService } from "../UserFarmService"
import { makePublisher } from "../queue/publisher"
import { User } from "core"

const SIX_HOURS_IN_SECONDS = 21600
let userFarmService: UserFarmService
let user: User

beforeEach(() => {
  const publisher = makePublisher()
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
  test("should decrement user plan as user farms", async () => {
    userFarmService.startFarm()
    expect(user.plan.getUsageLeft()).toBe(21600)
    jest.advanceTimersByTime(FARMING_INTERVAL_IN_SECONDS * 1000)
    userFarmService.stopFarm()
    expect(user.plan.getUsageLeft()).toBe(21600 - FARMING_INTERVAL_IN_SECONDS) // guest plan max usage
  })

  test("should empty the user plan usage left when uses all plan usage", async () => {
    userFarmService.startFarm()
    expect(user.plan.getUsageLeft()).toBe(SIX_HOURS_IN_SECONDS) // 6 hours in seconds
    jest.advanceTimersByTime(1000 * SIX_HOURS_IN_SECONDS) // 6 hours farmed
    userFarmService.stopFarm()
    expect(user.plan.getUsageLeft()).toBe(0)
  })

  test("should throw error when farming interval exceeds maximum plan's usage left", async () => {
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
