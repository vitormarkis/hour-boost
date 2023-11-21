import { GuestPlan, PlanRepository, PlanUsage, SilverPlan, Usage, User, UsersRepository } from "core"

import { FarmUsageService, IFarmService } from "~/application/services"
import { Publisher } from "../infra/queue"
import { UsersInMemory, PlanRepositoryInMemory, UsersRepositoryInMemory } from "../infra/repository"
import {
  PersistUsageHandler,
  ChangePlanStatusHandler,
  PlanExpiredMidFarmPersistPlanHandler,
} from "~/domain/handler"
import { PlanUsageExpiredMidFarmCommand } from "~/application/commands/PlanUsageExpiredMidFarmCommand"

const publisher = new Publisher()
let meDomain: User
let usersRepository: UsersRepository
let usersInMemory: UsersInMemory
let planRepository: PlanRepository

const ME_ID = "123"
const sleep = (time: number) =>
  new Promise(res => {
    setTimeout(res, time).unref()
    jest.advanceTimersByTime(time)
  })

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
  return new FarmUsageService(publisher, user.plan as PlanUsage, user.username)
}

describe("FarmUsageService test suite", () => {
  test("should throw when start to farm without add any accounts", async () => {
    const me = await getMe()
    const meFarmService = new FarmUsageService(publisher, me.plan as PlanUsage, me.username)
    expect(() => {
      meFarmService.startFarm()
    }).toThrow("Você não pode começar uma sessão de farm sem uma conta atribuída.")
  })

  test("should throw plan with no usage left attempts to farm", async () => {
    const me = await getMe()
    const allPlanUsage = Usage.create({
      amountTime: 21600,
      createdAt: new Date("2023-06-10T10:00:00Z"),
      plan_id: me.plan.id_plan,
      accountName: "acc1",
    })
    ;(me.plan as PlanUsage).use(allPlanUsage)
    await usersRepository.update(me)
    const dbMe = await usersRepository.getByID(ME_ID)
    if (!dbMe) throw new Error()
    const meFarmService = new FarmUsageService(publisher, dbMe.plan as PlanUsage, dbMe.username)
    expect(dbMe.plan).toBeInstanceOf(GuestPlan)
    expect((dbMe.plan as PlanUsage).getUsageLeft()).toBe(0)
    expect((dbMe.plan as PlanUsage).getUsageTotal()).toBe(21600)
    meFarmService.farmWithAccount("acc1")
    expect(meFarmService.hasAccounts).toBeTruthy()

    expect(() => {
      meFarmService.startFarm()
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
    console.log(meFarmService.getUsageLeft())
    meFarmService.farmWithAccount("acc1")
    console.log(meFarmService.getUsageLeft())
    meFarmService.startFarm()
    console.log(meFarmService.getUsageLeft())
    jest.advanceTimersByTime(1000 * 60 * 60 * 4) // 4 horas
    console.log(meFarmService.getUsageLeft())
    const me2 = await getMe()
    expect(me2.plan.status).toBe("FARMING")
    jest.advanceTimersByTime(1000 * 60 * 60 * 4) // 4 horas

    await sleep(200)
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

    const me3 = await getMe()
    expect(me3.plan.status).toBe("IDDLE")
  })

  test("should throw when plan infinity attemps to use the service", async () => {
    const me = await getMe()
    me.assignPlan(SilverPlan.create({ ownerId: me.id_user }))
    expect(() => {
      new FarmUsageService(publisher, me.plan as PlanUsage, me.username)
    }).toThrow("Tentativa de fazer usage farm com plano que não é do tipo USAGE.")
  })

  test("should start with status iddle", async () => {
    const me = await getMe()
    expect(me.plan.status).toBe("IDDLE")
  })

  test("should set status to farming once user start farming", async () => {
    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount("acc1")
    meFarmService.startFarm()
    const me2 = await getMe()
    expect(me2.plan.status).toBe("FARMING")
  })

  test("should set status to iddle again once user stop farming", async () => {
    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount("acc1")
    meFarmService.startFarm()
    meFarmService.stopFarm()
    const me2 = await getMe()
    expect(me2.plan.status).toBe("IDDLE")
  })

  test("should decrement user plan as user farms", async () => {
    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount("acc1")
    meFarmService.startFarm()
    jest.advanceTimersByTime(1000 * 60) // 1 minute
    meFarmService.stopFarm()
    await sleep(50)
    const me2 = await getMe()
    expect((me2.plan as PlanUsage).usages).toHaveLength(1)
    expect((me2.plan as PlanUsage).getUsageLeft()).toBe(21540)
  })

  test("should empty the user plan usage left when uses all plan usage", async () => {
    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount("acc1")
    meFarmService.startFarm()
    jest.advanceTimersByTime(1000 * 60 * 60 * 6) // 6 horas
    meFarmService.stopFarm()
    await sleep(50)
    jest.advanceTimersByTime(60)
    const me2 = await getMe()
    expect((me2.plan as PlanUsage).getUsageLeft()).toBe(0)
  })

  test("should track the usage of the account", async () => {
    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount("acc1")
    meFarmService.startFarm()
    jest.advanceTimersByTime(1000 * 60 * 60 * 6) // 6 horas
    meFarmService.stopFarm()
    const { usageAmount } = meFarmService.getAccountDetails("acc1") ?? {}
    expect(usageAmount).toBe(21600)
    await sleep(50)
    jest.advanceTimersByTime(60)
    const me2 = await getMe()
    expect((me2.plan as PlanUsage).getUsageLeft()).toBe(0)
  })

  test("should assign correct usage to the steam accounts", async () => {
    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount("acc1")
    meFarmService.farmWithAccount("acc2")
    meFarmService.startFarm()
    jest.advanceTimersByTime(1000 * 60 * 60 * 3) // 6 horas
    meFarmService.stopFarm()
    const acc1Details = meFarmService.getAccountDetails("acc1")
    const acc2Details = meFarmService.getAccountDetails("acc2")
    expect(acc1Details?.usageAmount).toBe(10800)
    expect(acc2Details?.usageAmount).toBe(10800)
  })

  test("should call one persist event to each one of the farming accounts", async () => {
    const [notify] = publisher.observers.filter(o => o.operation === "user-complete-farm-session")
    expect(notify).toBeTruthy()
    const handleCompleteFarmSession = jest.spyOn(notify, "notify")

    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount("acc1")
    meFarmService.farmWithAccount("acc2")
    meFarmService.farmWithAccount("acc3")
    meFarmService.startFarm()
    jest.advanceTimersByTime(1000 * 60 * 60 * 2) // 6 horas
    meFarmService.stopFarm()
    const usages = meFarmService.getAccountsUsages().map(acc => acc.usage)
    expect(usages[0].amountTime).toBe(7200)
    expect(usages[1].amountTime).toBe(7200)
    expect(usages[2].amountTime).toBe(7200)
    expect(usages[3]?.amountTime).toBeUndefined()
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
    meFarmService.farmWithAccount("acc1")
    meFarmService.farmWithAccount("acc2")
    meFarmService.startFarm()
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
    meFarmService.farmWithAccount("acc1")
    meFarmService.farmWithAccount("acc2")
    meFarmService.startFarm()
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

  test("should persist complex usages", async () => {
    const [notify] = publisher.observers.filter(o => o.operation === "user-complete-farm-session")
    const handleCompleteFarmSession = jest.spyOn(notify, "notify")

    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount("acc1")
    meFarmService.startFarm()
    expect(meFarmService.getActiveFarmingAccountsAmount()).toBe(1)
    jest.advanceTimersByTime(1000 * 60 * 60 * 1) // 1 hora
    meFarmService.pauseFarmOnAccount("acc1")
    expect(meFarmService.getActiveFarmingAccountsAmount()).toBe(0)
    jest.advanceTimersByTime(1000 * 60 * 60 * 2) // 2 horas

    meFarmService.farmWithAccount("acc1")
    meFarmService.farmWithAccount("acc2")
    jest.advanceTimersByTime(1000 * 60 * 60 * 1.5) // 1 hora e meia
    meFarmService.pauseFarmOnAccount("acc2")
    jest.advanceTimersByTime(1000 * 60 * 60 * 1.5) // 1 hora e meia
    meFarmService.stopFarm()
    expect(meFarmService.getUsageLeft()).toBe(1800)
    const usages = meFarmService.getAccountsUsages().map(acc => acc.usage)
    expect(usages).toHaveLength(2)
    expect(usages.find(u => u.accountName === "acc1")?.amountTime).toBe(14400)
    expect(usages.find(u => u.accountName === "acc2")?.amountTime).toBe(5400)

    expect(handleCompleteFarmSession).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "user-complete-farm-session",
      })
    )
    expect(handleCompleteFarmSession).toHaveBeenCalledTimes(2)
  })

  test("should persist complex usages even when the plan's max usage exceeds", async () => {
    const [expiredMidFarmHandler] = publisher.observers.filter(
      o => o.operation === "plan-usage-expired-mid-farm"
    )
    const handleExpiredMidFarm = jest.spyOn(expiredMidFarmHandler, "notify")

    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.farmWithAccount("acc1")
    meFarmService.startFarm()
    jest.advanceTimersByTime(1000 * 60 * 60 * 1.2)
    meFarmService.farmWithAccount("two")
    jest.advanceTimersByTime(1000 * 60 * 60 * 3.2)
    expect(meFarmService.getUsageLeft()).toBe(0)
    const usages = meFarmService.getAccountsUsages().map(acc => acc.usage)
    expect(usages.find(u => u.accountName === "acc1")?.amountTime).toBe(12960)
    expect(usages.find(u => u.accountName === "two")?.amountTime).toBe(8640)
    expect(usages).toHaveLength(2)

    const call = handleExpiredMidFarm.mock.calls[0][0] as PlanUsageExpiredMidFarmCommand
    expect(call.usages).toHaveLength(2)
    expect(call.usages.find(u => u.accountName === "acc1")?.amountTime).toBe(12960)
    expect(call.usages.find(u => u.accountName === "two")?.amountTime).toBe(8640)

    expect(handleExpiredMidFarm).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "plan-usage-expired-mid-farm",
      })
    )
    expect(handleExpiredMidFarm).toHaveBeenCalledTimes(1)
  })

  test("should call event when user end farm session", async () => {})
})
