import { PlanRepository, PlanUsage, SilverPlan, User, UsersRepository } from "core"

import { FarmUsageService, IFarmService } from "~/application/services"
import { Publisher } from "../infra/queue"
import { UsersInMemory, PlanRepositoryInMemory, UsersRepositoryInMemory } from "~/infra/repository"
import { PersistUsageHandler, ChangePlanStatusHandler } from "~/domain/handler"

const publisher = new Publisher()
let meDomain: User
let usersRepository: UsersRepository
let usersInMemory: UsersInMemory
let planRepository: PlanRepository

const ME_ID = "123"
const sleep = (time: number) =>
  new Promise(res => {
    setTimeout(res, time)
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

const getFarmService = (user: User): IFarmService => {
  return new FarmUsageService(publisher, user.plan as PlanUsage, user.username)
}

describe("FarmUsageService test suite", () => {
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
    meFarmService.startFarm()
    const me2 = await getMe()
    expect(me2.plan.status).toBe("FARMING")
  })

  test("should set status to iddle again once user stop farming", async () => {
    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.startFarm()
    meFarmService.stopFarm()
    const me2 = await getMe()
    expect(me2.plan.status).toBe("IDDLE")
  })

  test("should decrement user plan as user farms", async () => {
    const me = await getMe()
    const meFarmService = getFarmService(me)
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
    meFarmService.startFarm()
    jest.advanceTimersByTime(1000 * 60 * 60 * 6) // 6 horas
    meFarmService.stopFarm()
    await sleep(50)
    jest.advanceTimersByTime(60)
    const me2 = await getMe()
    expect((me2.plan as PlanUsage).getUsageLeft()).toBe(0)
  })

  test("should call event when farming interval exceeds maximum plan's usage left", async () => {
    const [notify] = publisher.observers.filter(o => o.operation === "user-complete-farm-session")
    expect(notify).toBeTruthy()
    console.log(notify)
    const finishFarmHandler = jest.spyOn(notify, "notify")

    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.startFarm()
    jest.advanceTimersByTime(1000 * 60 * 60 * 4) // 4 horas
    const me2 = await getMe()
    expect(me2.plan.status).toBe("FARMING")
    jest.advanceTimersByTime(1000 * 60 * 60 * 4) // 4 horas
    const me3 = await getMe()
    expect(me3.plan.status).toBe("IDDLE")

    await sleep(200)
    expect(finishFarmHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "user-complete-farm-session",
      })
    )
  })
})
