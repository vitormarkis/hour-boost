import { PlanType } from "core"
import { FarmService } from "~/application/services/FarmService"

const USER_ID = "123"
const PLAN_ID = "PLAN_123"
const USERNAME = "Name"
const ACCOUNT_NAME = "vrsl"
const ACCOUNT_NAME_2 = "pacco"
const ACCOUNT_NAME_3 = "rex"

let farmService: FarmService

beforeEach(() => {
  farmService = new FarmServiceImpl({
    startedAt: new Date("2023-06-10T10:00:00Z"),
    planId: PLAN_ID,
    userId: USER_ID,
    username: USERNAME
  })
})

describe("FarmService test suite", () => {
  test("should set the status to FARMING", async () => {
    expect(farmService.getServiceStatus()).toBe("IDDLE")
    farmService.farmWithAccount(ACCOUNT_NAME)
    expect(farmService.getServiceStatus()).toBe("FARMING")
  })

  test("should add new account to the account list", async () => {
    expect(farmService.getActiveFarmingAccountsAmount()).toBe(0)
    expect(farmService.hasAccountsFarming()).toBe(false)
    farmService.farmWithAccount(ACCOUNT_NAME)
    expect(farmService.getActiveFarmingAccountsAmount()).toBe(1)
    expect(farmService.hasAccountsFarming()).toBe(true)
  })

  test("should stop account", async () => {
    expect(farmService.hasAccountsFarming()).toBe(false)
    expect(farmService.getServiceStatus()).toBe("IDDLE")
    farmService.farmWithAccount(ACCOUNT_NAME)
    expect(farmService.hasAccountsFarming()).toBe(true)
    expect(farmService.getServiceStatus()).toBe("FARMING")
    farmService.pauseFarmOnAccount(ACCOUNT_NAME)
    expect(farmService.hasAccountsFarming()).toBe(false)
    expect(farmService.getServiceStatus()).toBe("IDDLE")
  })

  test("should resume farming", async () => {
    farmService.farmWithAccount(ACCOUNT_NAME)
    expect(farmService.hasAccountsFarming()).toBe(true)
    farmService.pauseFarmOnAccount(ACCOUNT_NAME)
    expect(farmService.hasAccountsFarming()).toBe(false)
    farmService.farmWithAccount(ACCOUNT_NAME)
    expect(farmService.hasAccountsFarming()).toBe(true)
  })

  test("should THROW if tried to stop account that was never registered", async () => {
    expect(() => {
      farmService.pauseFarmOnAccount(ACCOUNT_NAME)
    }).toThrow("NSTH: Tried to resume farming on account that don't exists.")
  })

  test("should print farming accounts properly: 2 farming, 1 iddle", async () => {
    farmService.farmWithAccount(ACCOUNT_NAME)
    farmService.farmWithAccount(ACCOUNT_NAME_2)
    farmService.farmWithAccount(ACCOUNT_NAME_3)
    farmService.pauseFarmOnAccount(ACCOUNT_NAME)
    expect(farmService.getFarmingAccounts()).toStrictEqual({
      vrsl: "IDDLE",
      pacco: "FARMING",
      rex: "FARMING"
    })
  })

})

class FarmServiceImpl extends FarmService {
  type: PlanType = "USAGE"
  protected startFarmImpl(): void {
  }
  protected stopFarmImpl(): void {
  }
}