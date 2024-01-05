let farmService: FarmService

import { DataOrError, PlanType } from "core"
import {
  CustomInstances,
  MakeTestInstancesProps,
  makeTestInstances,
  testUsers as s,
  validSteamAccounts,
} from "~/__tests__/instances"
import { AccountStatusList, FarmService } from "~/application/services/FarmService"

const log = console.log
console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})
let meInstances = i.makeUserInstances("me", s.me)

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  meInstances = await i.createUser("me")
  farmService = new FarmServiceImpl({
    startedAt: new Date("2023-06-10T10:00:00Z"),
    planId: meInstances.me.plan.id_plan,
    userId: meInstances.me.id_user,
    username: meInstances.me.username,
    publisher: i.publisher,
  })
}

beforeEach(async () => {
  await setupInstances({
    validSteamAccounts,
  })
})

beforeEach(() => {})

describe("FarmService test suite", () => {
  test("should set the status to FARMING", async () => {
    expect(farmService.getServiceStatus()).toBe("IDDLE")
    farmService.farmWithAccount(s.me.accountName)
    expect(farmService.getServiceStatus()).toBe("FARMING")
  })

  test("should add new account to the account list", async () => {
    expect(farmService.getActiveFarmingAccountsAmount()).toBe(0)
    expect(farmService.hasAccountsFarming()).toBe(false)
    farmService.farmWithAccount(s.me.accountName)
    expect(farmService.getActiveFarmingAccountsAmount()).toBe(1)
    expect(farmService.hasAccountsFarming()).toBe(true)
  })

  test("should stop account", async () => {
    expect(farmService.hasAccountsFarming()).toBe(false)
    expect(farmService.getServiceStatus()).toBe("IDDLE")
    farmService.farmWithAccount(s.me.accountName)
    expect(farmService.hasAccountsFarming()).toBe(true)
    expect(farmService.getServiceStatus()).toBe("FARMING")
    farmService.pauseFarmOnAccount(s.me.accountName)
    expect(farmService.hasAccountsFarming()).toBe(false)
    expect(farmService.getServiceStatus()).toBe("IDDLE")
  })

  test("should resume farming", async () => {
    farmService.farmWithAccount(s.me.accountName)
    expect(farmService.hasAccountsFarming()).toBe(true)
    farmService.pauseFarmOnAccount(s.me.accountName)
    expect(farmService.hasAccountsFarming()).toBe(false)
    farmService.farmWithAccount(s.me.accountName)
    expect(farmService.hasAccountsFarming()).toBe(true)
  })

  // test("should THROW if tried to stop account that was never registered", async () => {
  //   expect(() => {
  //     farmService.pauseFarmOnAccount(s.me.accountName)
  //   }).toThrow("NSTH: Tried to resume farming on account that don't exists.")
  // })

  test("should print farming accounts properly: 2 farming, 1 iddle", async () => {
    farmService.farmWithAccount(s.me.accountName)
    farmService.farmWithAccount(s.me.accountName2)
    farmService.farmWithAccount(s.me.accountName3)
    farmService.pauseFarmOnAccount(s.me.accountName)
    expect(farmService.getFarmingAccounts()).toStrictEqual({
      [s.me.accountName]: "IDDLE",
      [s.me.accountName2]: "FARMING",
      [s.me.accountName3]: "FARMING",
    })
  })
})

class FarmServiceImpl extends FarmService {
  getAccountsStatus(): AccountStatusList {
    return {}
  }
  protected publishCompleteFarmSession(): void {}
  farmWithAccountImpl(accountName: string): DataOrError<null> {
    if (this.accountsFarming.size === 0) {
      this.status = "FARMING"
    }
    return [null, null]
  }

  type: PlanType = "USAGE"
  protected startFarm(): DataOrError<null> {
    this.status = "FARMING"
    return [null, null]
  }
  protected stopFarm(): void {
    for (const [_, acc] of this.accountsFarming) {
      acc.status = "IDDLE"
    }
  }
  pauseFarmOnAccount(accountName: string): void {
    if (this.accountsFarming.size === 1) {
      this.status = "IDDLE"
    }

    for (const [accountNameStr, acc] of this.accountsFarming) {
      if (accountNameStr === accountName) {
        acc.status = "IDDLE"
      }
    }
  }
}
