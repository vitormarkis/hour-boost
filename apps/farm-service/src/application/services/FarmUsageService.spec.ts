import { GuestPlan, PlanRepository, PlanUsage, SilverPlan, Usage, User, UsersRepository } from "core"

import { PlanUsageExpiredMidFarmCommand } from "~/application/commands/PlanUsageExpiredMidFarmCommand"
import { FarmUsageService } from "~/application/services"
import {
  ChangePlanStatusHandler,
  PersistUsageHandler,
  PlanExpiredMidFarmPersistPlanHandler,
} from "~/domain/handler"
import { Publisher } from "../../infra/queue"
import { PlanRepositoryInMemory, UsersInMemory, UsersRepositoryInMemory } from "../../infra/repository"

const publisher = new Publisher()
let meDomain: User
let usersRepository: UsersRepository
let usersInMemory: UsersInMemory
let planRepository: PlanRepository

const now = new Date("2023-06-10")
const ME_ID = "123"
const ACCOUNT_NAME = "vrsl"
const ACCOUNT_PACCO = "pacco"
const ACCOUNT_REX = "rex"
const ACCOUNT_FRED = "fred"

beforeEach(async () => {
  meDomain = User.create({
    email: "json@mail.com",
    id_user: ME_ID,
    username: "jsonwebtoken",
  })
  usersInMemory = new UsersInMemory()
  usersRepository = new UsersRepositoryInMemory(usersInMemory)
  planRepository = new PlanRepositoryInMemory(usersInMemory)
  await usersRepository.create(meDomain)
  jest.useFakeTimers()
  publisher.register(new PersistUsageHandler(planRepository))
  publisher.register(new ChangePlanStatusHandler(planRepository))
  publisher.register(new PlanExpiredMidFarmPersistPlanHandler(planRepository))
})

afterEach(() => {
  publisher.observers = []
})

afterAll(() => {
  jest.useRealTimers()
})

const getMe = async () => {
  const me = await usersRepository.getByID(ME_ID)
  if (!me) throw new Error("USER NOT FOUND")
  if (!(me.plan instanceof PlanUsage)) throw new Error("Plan is not usage.")
  return me
}

const getFarmService = (user: User) => {
  return new FarmUsageService(publisher, user.plan as PlanUsage, user.username, now)
}

describe("FarmUsageService test suite", () => {
  test("should throw plan with no usage left attempts to farm", async () => {
    const me = await getMe()
    const allPlanUsage = Usage.create({
      amountTime: 21600,
      createdAt: new Date("2023-06-10T10:00:00Z"),
      plan_id: me.plan.id_plan,
      accountName: ACCOUNT_PACCO,
    })
    ;(me.plan as PlanUsage).use(allPlanUsage)
    await usersRepository.update(me)
    const dbMe = await usersRepository.getByID(ME_ID)
    if (!dbMe) throw new Error()
    const meFarmService = new FarmUsageService(publisher, dbMe.plan as PlanUsage, dbMe.username, now)
    expect(dbMe.plan).toBeInstanceOf(GuestPlan)
    expect((dbMe.plan as PlanUsage).getUsageLeft()).toBe(0)
    expect((dbMe.plan as PlanUsage).getUsageTotal()).toBe(21600)

    expect(() => {
      meFarmService.farmWithAccount(ACCOUNT_NAME)
    }).toThrow("Seu plano não possui mais uso disponível.")
  })

  test("should call event when farming interval exceeds maximum plan's usage left", async () => {
    const [notify] = publisher.observers.filter(o => o.operation === "user-complete-farm-session")
    expect(notify).toBeTruthy()
    const handleCompleteFarmSession = jest.spyOn(notify, "notify")

    const [notify1] = publisher.observers.filter(o => o.operation === "plan-usage-expired-mid-farm")
    expect(notify1).toBeTruthy()
    const planUsageRunOutMidFarm = jest.spyOn(notify1, "notify")

    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount(ACCOUNT_PACCO)
    meFarmService.farmWithAccount(ACCOUNT_NAME)
    jest.advanceTimersByTime(1000 * 60 * 60 * 4) // 4 horas
    jest.advanceTimersByTime(1000 * 60 * 60 * 4) // 4 horas

    expect(handleCompleteFarmSession).not.toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "user-complete-farm-session",
      })
    )
    expect(planUsageRunOutMidFarm).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "plan-usage-expired-mid-farm",
      })
    )
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
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount(ACCOUNT_PACCO)
    meFarmService.farmWithAccount(ACCOUNT_NAME)
    const me2 = await getMe()
    expect(me2.plan.status).toBe("FARMING")
  })

  test("should set status to iddle again once user stop farming", async () => {
    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount(ACCOUNT_NAME)
    meFarmService.farmWithAccount(ACCOUNT_PACCO)
    expect(meFarmService.hasAccountsFarming()).toBeTruthy()
    meFarmService.pauseFarmOnAccount(ACCOUNT_NAME)
    meFarmService.pauseFarmOnAccount(ACCOUNT_PACCO)
    expect(meFarmService.hasAccountsFarming()).toBeFalsy()
  })

  test("should decrement user plan as user farms", async () => {
    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount(ACCOUNT_NAME)
    jest.advanceTimersByTime(1000 * 60) // 1 minute
    meFarmService.stopFarmAllAccounts()
    const me2 = await getMe()
    expect((me2.plan as PlanUsage).usages.data).toHaveLength(1)
    expect((me2.plan as PlanUsage).getUsageLeft()).toBe(21540)
  })

  test("should empty the user plan usage left when uses all plan usage", async () => {
    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount(ACCOUNT_PACCO)
    meFarmService.farmWithAccount(ACCOUNT_NAME)
    jest.advanceTimersByTime(1000 * 60 * 60 * 6) // 6 horas
    meFarmService.farmWithAccount(ACCOUNT_NAME)
    jest.advanceTimersByTime(60)
    const me2 = await getMe()
    expect((me2.plan as PlanUsage).getUsageLeft()).toBe(0)
  })

  test("should track the usage of the account", async () => {
    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount(ACCOUNT_NAME)
    meFarmService.farmWithAccount(ACCOUNT_PACCO)
    jest.advanceTimersByTime(1000 * 60 * 60 * 6) // 6 horas
    meFarmService.stopFarmAllAccounts()
    const { usageAmountInSeconds: usageAmount1 } = meFarmService.getAccountDetails(ACCOUNT_NAME) ?? {}
    const { usageAmountInSeconds: usageAmount2 } = meFarmService.getAccountDetails(ACCOUNT_PACCO) ?? {}
    expect(usageAmount1).toBe(21600 / 2)
    expect(usageAmount2).toBe(21600 / 2)
    jest.advanceTimersByTime(60)
    const me2 = await getMe()
    expect((me2.plan as PlanUsage).getUsageLeft()).toBe(0)
  })

  test("should assign correct usage to the steam accounts", async () => {
    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount(ACCOUNT_NAME)
    meFarmService.farmWithAccount(ACCOUNT_PACCO)
    meFarmService.farmWithAccount(ACCOUNT_REX)
    jest.advanceTimersByTime(1000 * 60 * 60 * 3) // 6 horas
    meFarmService.stopFarmAllAccounts()
    const acc1Details = meFarmService.getAccountDetails(ACCOUNT_NAME)
    const acc2Details = meFarmService.getAccountDetails(ACCOUNT_PACCO)
    const acc3Details = meFarmService.getAccountDetails(ACCOUNT_REX)
    expect(acc1Details?.usageAmountInSeconds).toBe(7200)
    expect(acc2Details?.usageAmountInSeconds).toBe(7200)
    expect(acc3Details?.usageAmountInSeconds).toBe(7200)
  })

  test("should call one persist event to each one of the farming accounts", async () => {
    const [notify] = publisher.observers.filter(o => o.operation === "user-complete-farm-session")
    expect(notify).toBeTruthy()
    const handleCompleteFarmSession = jest.spyOn(notify, "notify")

    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount(ACCOUNT_NAME)
    meFarmService.farmWithAccount(ACCOUNT_PACCO)
    meFarmService.farmWithAccount(ACCOUNT_REX)
    jest.advanceTimersByTime(1000 * 60 * 60 * 2) // 6 horas
    meFarmService.stopFarmAllAccounts()
    const usages = meFarmService.getAccountsUsages().map(acc => acc.usage)
    expect(usages[0].amountTime).toBe(7200)
    expect(usages[1].amountTime).toBe(7200)
    expect(usages[2].amountTime).toBe(7200)
    expect(handleCompleteFarmSession).toHaveBeenCalledTimes(3)
    expect(handleCompleteFarmSession).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "user-complete-farm-session",
      })
    )
  })

  test("should call one persist event to each one of the farming accounts when plan's maximum usage exceeds", async () => {
    const [notify] = publisher.observers.filter(o => o.operation === "user-complete-farm-session")
    expect(notify).toBeTruthy()
    const handleCompleteFarmSession = jest.spyOn(notify, "notify")

    const expiredMidFarmHandlers = publisher.observers.filter(
      o => o.operation === "plan-usage-expired-mid-farm"
    )
    expect(expiredMidFarmHandlers).toHaveLength(1)
    const handleExpiredMidFarm = jest.spyOn(expiredMidFarmHandlers[0], "notify")

    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount(ACCOUNT_NAME)
    meFarmService.farmWithAccount(ACCOUNT_PACCO)
    jest.advanceTimersByTime(1000 * 60 * 60 * 4) // 4 horas
    expect(handleCompleteFarmSession).not.toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "user-complete-farm-session",
      })
    )
    expect(handleExpiredMidFarm).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "plan-usage-expired-mid-farm",
      })
    )
    expect(handleCompleteFarmSession).toHaveBeenCalledTimes(0)
    expect(handleExpiredMidFarm).toHaveBeenCalledTimes(1)
    const call = handleExpiredMidFarm.mock.calls[0][0] as PlanUsageExpiredMidFarmCommand
    expect(call.usages).toHaveLength(2)
    expect(call.usages[0].amountTime).toBe(10800)
    expect(call.usages[1].amountTime).toBe(10800)

    const usages = meFarmService.getAccountsUsages().map(acc => acc.usage)
    expect(usages[0].amountTime).toBe(10800)
    expect(usages[1].amountTime).toBe(10800)
    expect(usages[2]?.amountTime).toBeUndefined()
  })

  test("should call one persist event to each one of the farming accounts when plan's maximum usage exceeds", async () => {
    const [notify] = publisher.observers.filter(o => o.operation === "user-complete-farm-session")
    expect(notify).toBeTruthy()
    const handleCompleteFarmSession = jest.spyOn(notify, "notify")

    const expiredMidFarmHandlers = publisher.observers.filter(
      o => o.operation === "plan-usage-expired-mid-farm"
    )
    expect(expiredMidFarmHandlers).toHaveLength(1)
    const handleExpiredMidFarm = jest.spyOn(expiredMidFarmHandlers[0], "notify")

    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount(ACCOUNT_NAME)
    meFarmService.farmWithAccount(ACCOUNT_PACCO)
    jest.advanceTimersByTime(1000 * 60 * 60 * 4) // 4 horas
    expect(handleCompleteFarmSession).not.toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "user-complete-farm-session",
      })
    )
    expect(handleExpiredMidFarm).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "plan-usage-expired-mid-farm",
      })
    )
    expect(handleCompleteFarmSession).toHaveBeenCalledTimes(0)
    expect(handleExpiredMidFarm).toHaveBeenCalledTimes(1)
    const call = handleExpiredMidFarm.mock.calls[0][0] as PlanUsageExpiredMidFarmCommand
    expect(call.usages).toHaveLength(2)
    expect(call.usages[0].amountTime).toBe(10800)
    expect(call.usages[1].amountTime).toBe(10800)
    expect(call.usages[2]?.amountTime).toBeUndefined()

    const usages = meFarmService.getAccountsUsages().map(acc => acc.usage)
    expect(usages[0].amountTime).toBe(10800)
    expect(usages[1].amountTime).toBe(10800)
    expect(usages[2]?.amountTime).toBeUndefined()
  })

  test("should persist complex usages", async () => {
    const [notify] = publisher.observers.filter(o => o.operation === "user-complete-farm-session")
    const handleCompleteFarmSession = jest.spyOn(notify, "notify")

    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount(ACCOUNT_PACCO)
    expect(meFarmService.getActiveFarmingAccountsAmount()).toBe(1)
    jest.advanceTimersByTime(1000 * 60 * 60 * 1) // 1 hora
    // acc2: 3600; left: 18000
    meFarmService.pauseFarmOnAccount(ACCOUNT_PACCO)
    expect(meFarmService.getActiveFarmingAccountsAmount()).toBe(0)
    jest.advanceTimersByTime(1000 * 60 * 60 * 2) // 2 horas
    // acc2: 3600; left: 18000

    meFarmService.farmWithAccount(ACCOUNT_PACCO)
    meFarmService.farmWithAccount(ACCOUNT_REX)
    jest.advanceTimersByTime(1000 * 60 * 60 * 1.5) // 1 hora e meia
    // acc2: 9000; acc3: 5400; left: 7200
    meFarmService.pauseFarmOnAccount(ACCOUNT_REX)
    jest.advanceTimersByTime(1000 * 60 * 60 * 1.5) // 1 hora e meia
    // acc2: 14400; acc3: 5400; left: 1800
    meFarmService.stopFarmAllAccounts()
    expect(meFarmService.getUsageLeft()).toBe(1800)
    const usages = meFarmService.getAccountsUsages().map(acc => acc.usage)
    expect(usages).toHaveLength(2)
    expect(usages.find(u => u.accountName === ACCOUNT_PACCO)?.amountTime).toBe(14400)
    expect(usages.find(u => u.accountName === ACCOUNT_REX)?.amountTime).toBe(5400)

    expect(handleCompleteFarmSession).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "user-complete-farm-session",
      })
    )
    expect(handleCompleteFarmSession).toHaveBeenCalledTimes(3)
  })

  test("should persist complex usages even when the plan's max usage exceeds", async () => {
    const [expiredMidFarmHandler] = publisher.observers.filter(
      o => o.operation === "plan-usage-expired-mid-farm"
    )
    const handleExpiredMidFarm = jest.spyOn(expiredMidFarmHandler, "notify")

    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount(ACCOUNT_PACCO)
    meFarmService.farmWithAccount(ACCOUNT_NAME)
    jest.advanceTimersByTime(1000 * 60 * 60 * 1.2)
    // pacco: 4320; vrsl: 4320; left: 12.960
    meFarmService.farmWithAccount(ACCOUNT_REX)
    jest.advanceTimersByTime(1000 * 60 * 60 * 3.2)
    // pacco: 8640; vrsl: 8640; rex: 4320; left: 12.960
    expect(meFarmService.getUsageLeft()).toBe(0)
    const usages = meFarmService.getAccountsUsages().map(acc => acc.usage)
    expect(usages.find(u => u.accountName === ACCOUNT_NAME)?.amountTime).toBe(8640)
    expect(usages.find(u => u.accountName === ACCOUNT_PACCO)?.amountTime).toBe(8640)
    expect(usages.find(u => u.accountName === ACCOUNT_REX)?.amountTime).toBe(4320)
    expect(usages).toHaveLength(3)

    const call = handleExpiredMidFarm.mock.calls[0][0] as PlanUsageExpiredMidFarmCommand
    expect(call.usages).toHaveLength(3)
    expect(call.usages.find(u => u.accountName === ACCOUNT_NAME)?.amountTime).toBe(8640)
    expect(call.usages.find(u => u.accountName === ACCOUNT_PACCO)?.amountTime).toBe(8640)
    expect(call.usages.find(u => u.accountName === ACCOUNT_REX)?.amountTime).toBe(4320)

    expect(handleExpiredMidFarm).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "plan-usage-expired-mid-farm",
      })
    )
    expect(handleExpiredMidFarm).toHaveBeenCalledTimes(1)
  })

  test("should call event when user end farm session", async () => {})
})
