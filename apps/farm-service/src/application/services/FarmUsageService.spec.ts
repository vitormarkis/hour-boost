import { GuestPlan, PlanUsage, Usage, User } from "core"
import {
  CustomInstances,
  MakeTestInstancesProps,
  makeTestInstances,
  makeUserInstances,
  testUsers as s,
  validSteamAccounts,
} from "~/__tests__/instances"
import { UserCompletedFarmSessionUsageCommand } from "~/application/commands"
import { FarmUsageService } from "~/application/services"
import { ChangePlanStatusHandler, PersistFarmSessionUsageHandler } from "~/domain/handler"

const log = console.log
console.log = () => {}

const now = new Date("2023-06-10T10:00:00Z")
let i = makeTestInstances({
  validSteamAccounts,
})
let meInstances = makeUserInstances("me", s.me, i.sacFactory)

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  meInstances = await i.createUser("me")
}

beforeEach(async () => {
  jest.useFakeTimers({ doNotFake: ["setImmediate"] })
  await setupInstances({
    validSteamAccounts,
  })
  i.publisher.register(new PersistFarmSessionUsageHandler(i.planRepository, i.usageBuilder))
  i.publisher.register(new ChangePlanStatusHandler(i.planRepository))
})

afterAll(() => {
  jest.useRealTimers()
})

const getMe = async () => {
  const me = await i.usersRepository.getByID(s.me.userId)
  if (!me) throw new Error("USER NOT FOUND")
  if (!(me.plan instanceof PlanUsage)) throw new Error("Plan is not usage.")
  return me
}

const getFarmService = (user: User) => {
  return new FarmUsageService({
    emitter: i.emitterBuilder.create(),
    now,
    plan: user.plan as PlanUsage,
    publisher: i.publisher,
    username: user.username,
  })
}

async function getPlanByOwnerId(planId: string): Promise<PlanUsage> {
  const plan = await i.planRepository.getById(planId)
  if (!(plan instanceof PlanUsage)) throw new Error(`Invalid error type: ${plan?.type}`)
  return plan
}

describe("FarmUsageService test suite", () => {
  describe("Exceeds max usage test suite", () => {
    let farmService: FarmUsageService
    let spyFarmServiceEmit: jest.SpyInstance
    let spyPublishCompleteFarmSession: jest.SpyInstance
    let spyPublish: jest.SpyInstance

    beforeEach(async () => {
      farmService = getFarmService(meInstances.me)
      spyFarmServiceEmit = jest.spyOn(farmService.emitter, "emit")
      spyPublishCompleteFarmSession = jest.spyOn(farmService, "publishCompleteFarmSession")
      spyPublish = jest.spyOn(i.publisher, "publish")
      farmService.farmWithAccount(s.me.accountName)
      jest.advanceTimersByTime(1000 * 3600 * 4) // 4 horas
      farmService.farmWithAccount(s.me.accountName2)
      // depois de 4 horas de 1 conta farmando, e 1 hora de 2 farmando, deveria bater as 6 horas máximas do plano
      jest.advanceTimersByTime(1000 * 3600 * 4) // 4 hora
      await new Promise(setImmediate)
    })

    test("should farm with 2 accounts, exceed plan max usage, and call max-usage-exceeded event", async () => {
      console.log({ listAllListeners: farmService.emitter.listAllListeners() })
      expect(farmService.emitter.listEventListenersAmount("service:max-usage-exceeded")).toBe(1)
      expect(spyFarmServiceEmit).toHaveBeenCalledWith("service:max-usage-exceeded")
    })

    test("should farm with 2 accounts, exceed plan max usage, and ensure the accounts are IDDLE", async () => {
      expect(farmService.getAccountsStatus()).toStrictEqual({
        [s.me.accountName]: "IDDLE",
        [s.me.accountName2]: "IDDLE",
      })
      expect(spyPublishCompleteFarmSession).toHaveBeenCalledTimes(1)
    })

    test("should farm with 2 accounts, exceed plan max usage, and publish user-complete-farm-session-usage command", async () => {
      jest.advanceTimersByTime(1000 * 3600 * 4) // 4 hora
      await new Promise(setImmediate)
      expect(spyPublishCompleteFarmSession).toHaveBeenCalledTimes(1)
      expect(spyPublish).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: "user-complete-farm-session-usage",
        })
      )
    })

    test("should farm with 2 accounts, exceed plan max usage, and persit correct usages", async () => {
      const plan = await getPlanByOwnerId(meInstances.me.plan.id_plan)
      expect(plan.usages.data).toHaveLength(2)
      console.log(plan.usages.data)
      expect(plan.usages.data[0]).toStrictEqual(
        expect.objectContaining({
          accountName: s.me.accountName,
          amountTime: 3600 * 5,
        })
      )
      expect(plan.usages.data[1]).toStrictEqual(
        expect.objectContaining({
          accountName: s.me.accountName2,
          amountTime: 3600 * 1,
        })
      )
    })
  })

  test("should persist complex usages even when the plan's max usage exceeds", async () => {
    const spyPublish = jest.spyOn(i.publisher, "publish")

    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount(s.me.accountName)
    meFarmService.farmWithAccount(s.me.accountName2)
    jest.advanceTimersByTime(1000 * 60 * 60 * 1.2)
    // paco: 4320; bane: 4320; left: 12.960
    meFarmService.farmWithAccount(s.me.accountName3)
    jest.advanceTimersByTime(1000 * 60 * 60 * 3.2)
    // pacco: 8640; bane: 8640; plan: 4320; left: 0
    expect(meFarmService.getUsageLeft()).toBe(0)

    const publishesUserCompleteFarmSession = spyPublish.mock.calls
      .filter(s => s[0].operation === "user-complete-farm-session-usage")
      .map(command => command[0]) as UserCompletedFarmSessionUsageCommand[]

    expect(spyPublish).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "user-complete-farm-session-usage",
      })
    )

    expect(publishesUserCompleteFarmSession[0].farmingAccountDetails).toHaveLength(3)
    expect(publishesUserCompleteFarmSession[0]).toStrictEqual(
      expect.objectContaining({
        farmingAccountDetails: expect.arrayContaining([
          {
            usageAmountInSeconds: 8640, // 2hrs 24min
            status: "IDDLE",
            accountName: s.me.accountName,
          },
          {
            usageAmountInSeconds: 8640, // 2hrs 24min
            status: "IDDLE",
            accountName: s.me.accountName2,
          },
          {
            usageAmountInSeconds: 4320, // 1hr 12min
            status: "IDDLE",
            accountName: s.me.accountName3,
          },
        ]),
      })
    )
  })

  test("should farm with 2 accounts", async () => {
    const farmService = getFarmService(meInstances.me)
    farmService.farmWithAccount(s.me.accountName)
    jest.advanceTimersByTime(1000 * 3600 * 4) // 4 horas
    farmService.farmWithAccount(s.me.accountName2)
    expect(farmService.getAccountsStatus()).toStrictEqual({
      [s.me.accountName]: "FARMING",
      [s.me.accountName2]: "FARMING",
    })
  })

  test("should throw plan with no usage left attempts to farm", async () => {
    const allPlanUsage = Usage.create({
      amountTime: 21600,
      createdAt: new Date("2023-06-10T10:00:00Z"),
      plan_id: meInstances.me.plan.id_plan,
      accountName: s.me.accountName,
    })
    await i.usePlan(s.me.userId, allPlanUsage)
    const plan = await getPlanByOwnerId(meInstances.me.plan.id_plan)
    expect(plan).toBeInstanceOf(GuestPlan)
    expect(plan.getUsageLeft()).toBe(0)
    expect(plan.getUsageTotal()).toBe(21600)
    const farmService = getFarmService(meInstances.me)

    expect(() => {
      farmService.farmWithAccount(s.me.accountName)
    }).toThrow("Seu plano não possui mais uso disponível.")
  })

  // test("should throw when plan infinity attemps to use the service", async () => {
  //   const me = await getMe()
  //   me.assignPlan(SilverPlan.create({ ownerId: me.id_user }))
  //   expect(() => {
  //     new FarmUsageService(publisher, me.plan, me.username, now)
  //   }).toThrow("Tentativa de fazer usage farm com plano que não é do tipo USAGE.")
  // })

  test("should start with status iddle", async () => {
    const me = await getMe()
    expect(me.plan.status).toBe("IDDLE")
  })

  test("should set status to farming once user start farming", async () => {
    const me = await getMe()
    expect(me.plan.status).toBe("IDDLE")
    const meFarmService = getFarmService(meInstances.me)
    meFarmService.farmWithAccount(s.me.accountName)
    meFarmService.farmWithAccount(s.me.accountName2)
    const me2 = await getMe()
    await new Promise(setImmediate)
    expect(me2.plan.status).toBe("FARMING")
  })

  test("should set status to iddle again once user stop farming", async () => {
    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount(s.me.accountName2)
    meFarmService.farmWithAccount(s.me.accountName)
    expect(meFarmService.hasAccountsFarming()).toBeTruthy()
    meFarmService.pauseFarmOnAccount(s.me.accountName2)
    meFarmService.pauseFarmOnAccount(s.me.accountName)
    expect(meFarmService.hasAccountsFarming()).toBeFalsy()
  })

  test("should decrement user plan as user farms", async () => {
    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount(s.me.accountName2)
    jest.advanceTimersByTime(1000 * 60) // 1 minute
    meFarmService.stopFarmAllAccounts()
    const me2 = await getMe()
    expect((me2.plan as PlanUsage).usages.data).toHaveLength(1)
    expect((me2.plan as PlanUsage).getUsageLeft()).toBe(21540)
  })

  test("should empty the user plan usage left when uses all plan usage", async () => {
    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount(s.me.accountName)
    meFarmService.farmWithAccount(s.me.accountName2)
    jest.advanceTimersByTime(1000 * 60 * 60 * 6) // 6 horas
    await new Promise(setImmediate)
    const me2 = await getMe()
    expect((me2.plan as PlanUsage).getUsageLeft()).toBe(0)
  })

  test("should track the usage of the account", async () => {
    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount(s.me.accountName2)
    meFarmService.farmWithAccount(s.me.accountName)
    jest.advanceTimersByTime(1000 * 60 * 60 * 6) // 6 horas
    meFarmService.stopFarmAllAccounts()
    const { usageAmountInSeconds: usageAmount1 } = meFarmService.getAccountDetails(s.me.accountName2) ?? {}
    const { usageAmountInSeconds: usageAmount2 } = meFarmService.getAccountDetails(s.me.accountName) ?? {}
    expect(usageAmount1).toBe(21600 / 2)
    expect(usageAmount2).toBe(21600 / 2)
    jest.advanceTimersByTime(60)
    const me2 = await getMe()
    expect((me2.plan as PlanUsage).getUsageLeft()).toBe(0)
  })

  test("should assign correct usage to the steam accounts", async () => {
    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount(s.me.accountName2)
    meFarmService.farmWithAccount(s.me.accountName)
    meFarmService.farmWithAccount(s.me.accountName3)
    jest.advanceTimersByTime(1000 * 60 * 60 * 3) // 6 horas
    meFarmService.stopFarmAllAccounts()
    const acc1Details = meFarmService.getAccountDetails(s.me.accountName2)
    const acc2Details = meFarmService.getAccountDetails(s.me.accountName)
    const acc3Details = meFarmService.getAccountDetails(s.me.accountName3)
    expect(acc1Details?.usageAmountInSeconds).toBe(7200)
    expect(acc2Details?.usageAmountInSeconds).toBe(7200)
    expect(acc3Details?.usageAmountInSeconds).toBe(7200)
  })

  test("should persist complex usages - two accounts farming", async () => {
    const spyPublish = jest.spyOn(i.publisher, "publish")

    const meFarmService = getFarmService(meInstances.me)
    meFarmService.farmWithAccount(s.me.accountName)
    meFarmService.farmWithAccount(s.me.accountName2)
    jest.advanceTimersByTime(1000 * 60 * 60 * 0.5) // 1 hora e meia
    // 1800 * 2
    meFarmService.pauseFarmOnAccount(s.me.accountName2)
    jest.advanceTimersByTime(1000 * 60 * 60 * 2) // 2 horas
    console.log({
      acc1: meFarmService.getAccountDetails(s.me.accountName),
      acc2: meFarmService.getAccountDetails(s.me.accountName2),
    })
    // 1800 * 2 + 7200
    meFarmService.pauseFarmOnAccount(s.me.accountName) // persistiu
    await new Promise(setImmediate)

    const publishesUserCompleteFarmSession = spyPublish.mock.calls
      .filter(s => s[0].operation === "user-complete-farm-session-usage")
      .map(command => command[0]) as UserCompletedFarmSessionUsageCommand[]

    expect(spyPublish).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "user-complete-farm-session-usage",
      })
    )

    expect(publishesUserCompleteFarmSession[0].farmingAccountDetails).toHaveLength(2)
    expect(publishesUserCompleteFarmSession[0]).toStrictEqual(
      expect.objectContaining({
        farmingAccountDetails: expect.arrayContaining([
          {
            usageAmountInSeconds: 9000, // 1 hora
            status: "IDDLE",
            accountName: s.me.accountName,
          },
          {
            usageAmountInSeconds: 1800, // 1 hora
            status: "IDDLE",
            accountName: s.me.accountName2,
          },
        ]),
      })
    )
  })

  test("should persist complex usages", async () => {
    const spyPublish = jest.spyOn(i.publisher, "publish")

    const meFarmService = getFarmService(meInstances.me)
    meFarmService.farmWithAccount(s.me.accountName)
    jest.advanceTimersByTime(1000 * 60 * 60 * 1) // 1 hora
    // acc2: 3600; left: 18000
    meFarmService.pauseFarmOnAccount(s.me.accountName) // persistiu
    await new Promise(setImmediate)

    const meFarmService2 = getFarmService(meInstances.me)
    meFarmService2.farmWithAccount(s.me.accountName)
    meFarmService2.farmWithAccount(s.me.accountName3)
    jest.advanceTimersByTime(1000 * 60 * 60 * 1.5) // 1 hora e meia
    // acc2total: 9000; acc2: 5400; acc3: 5400; left: 7200
    meFarmService2.pauseFarmOnAccount(s.me.accountName3)
    jest.advanceTimersByTime(1000 * 60 * 60 * 1.5) // 1 hora e meia
    // acc2total: 14400; acc2: 10800; acc3: 5400; left: 1800
    meFarmService2.pauseFarmOnAccount(s.me.accountName) // persistiu
    await new Promise(setImmediate)

    const publishesUserCompleteFarmSession = spyPublish.mock.calls
      .filter(s => s[0].operation === "user-complete-farm-session-usage")
      .map(command => command[0]) as UserCompletedFarmSessionUsageCommand[]
    console.log({
      calls: publishesUserCompleteFarmSession,
    })

    expect(spyPublish).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "user-complete-farm-session-usage",
      })
    )

    expect(publishesUserCompleteFarmSession).toHaveLength(2)
    expect(publishesUserCompleteFarmSession[0].farmingAccountDetails).toHaveLength(1)
    expect(publishesUserCompleteFarmSession[0]).toStrictEqual(
      expect.objectContaining({
        farmingAccountDetails: [
          {
            usageAmountInSeconds: 3600, // 1 hora
            status: "IDDLE",
            accountName: s.me.accountName,
          },
        ],
      })
    )

    expect(publishesUserCompleteFarmSession[1].farmingAccountDetails).toHaveLength(2)
    expect(publishesUserCompleteFarmSession[1]).toStrictEqual(
      expect.objectContaining({
        farmingAccountDetails: expect.arrayContaining([
          {
            usageAmountInSeconds: 10800, // 1 hora
            status: "IDDLE",
            accountName: s.me.accountName,
          },
          {
            usageAmountInSeconds: 5400, // 1 hora
            status: "IDDLE",
            accountName: s.me.accountName3,
          },
        ]),
      })
    )
  })

  test("should call event when user end farm session", async () => {
    const spyPublish = jest.spyOn(i.publisher, "publish")
    jest.setSystemTime(new Date("2023-06-10T10:00:00Z"))
    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount(s.me.accountName)
    jest.advanceTimersByTime(1000 * 60 * 60 * 4) // 6 horas
    meFarmService.pauseFarmOnAccount(s.me.accountName)
    await new Promise(setImmediate)
    expect(spyPublish.mock.calls).toStrictEqual(
      expect.arrayContaining([
        [
          new UserCompletedFarmSessionUsageCommand({
            farmingAccountDetails: [
              {
                accountName: s.me.accountName,
                status: "IDDLE",
                usageAmountInSeconds: 3600 * 4,
              },
            ],
            planId: meInstances.me.plan.id_plan,
            when: new Date("2023-06-10T14:00:00Z"),
          }),
        ],
      ])
    )
  })
})
