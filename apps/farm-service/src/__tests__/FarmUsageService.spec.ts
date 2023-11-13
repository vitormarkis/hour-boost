import { PlanRepository, PlanUsage, User, UsersRepository } from "core"

import { FarmUsageService, IFarmService } from "~/application/services"
import { Publisher } from "../infra/queue"
import {
  UsersInMemory,
  PlanRepositoryInMemory,
  UsersRepositoryInMemory,
  UsagesRepositoryDatabase,
} from "~/infra/repository"
import { UserHasStartFarmingCommand } from "~/application/commands"
import {
  PersistFarmSessionHandler,
  PersistUsageHandler,
  PlanUsageExpiredMidFarmCommand,
} from "~/domain/handler"

const publisher = new Publisher()
const SIX_HOURS_IN_SECONDS = 21600
let meDomain: User
let usersRepository: UsersRepository
let usersInMemory: UsersInMemory
let planRepository: PlanRepository

// publisher.register({
//   operation: "user-has-start-farming",
//   async notify({ props: { planId } }: UserHasStartFarmingCommand) {
//     const plan = await planRepository.getById(planId)
//     if(plan instanceof PlanUsage) {
//       plan.use()
//     }
//   },
// })

const ME_ID = "123"
const sleep = (time: number) =>
  new Promise(res => {
    setTimeout(res, time)
    jest.advanceTimersByTime(time)
  })

publisher.register({
  operation: "user-has-start-farming",
  async notify({ props: { userId } }: UserHasStartFarmingCommand) {
    const user = await usersRepository.getByID(userId)
    if (user) {
      user.plan.startFarm()
      await usersRepository.update(user)
    }
  },
})

publisher.register({
  operation: "user-complete-farm-session",
  async notify({ userId, usage, planId }: PlanUsageExpiredMidFarmCommand) {
    const user = await usersRepository.getByID(userId)
    if (user) {
      user.plan.stopFarm()
      await usersRepository.update(user)
    }
    const plan = await planRepository.getById(planId)
    if (plan instanceof PlanUsage) {
      plan.use(usage)
      await planRepository.update(plan)
    }
  },
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
})

const getMe = async () => {
  const me = await usersRepository.getByID(ME_ID)
  if (!me) throw new Error("USER NOT FOUND")
  if (!(me.plan instanceof PlanUsage)) throw new Error("Plan is not usage.")
  return me
}

const getFarmService = (user: User): IFarmService => {
  if (!(user.plan instanceof PlanUsage)) throw new Error()
  return new FarmUsageService(
    publisher,
    user.plan.getUsageLeft(),
    user.plan.id_plan,
    user.id_user,
    user.username
  )
}

afterAll(() => {
  jest.useRealTimers()
})

describe("FarmUsageService test suite", () => {
  // test("should throw when plan infinity attemps to use the service", async () => {
  //   const me = await getMe()
  //   me.assignPlan(SilverPlan.create({ ownerId: me.id_user }))
  //   const meFarmService = getFarmService(me)
  //   expect(meFarmService.startFarm()).rejects.toThrow("O plano de jsonwebtoken não é do tipo USAGE.")
  // })

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
    const me = await getMe()
    const meFarmService = getFarmService(me)
    meFarmService.startFarm()
    jest.advanceTimersByTime(1000 * 60 * 60 * 4) // 4 horas
    const me2 = await getMe()
    expect(me2.plan.status).toBe("FARMING")
    jest.advanceTimersByTime(1000 * 60 * 60 * 4) // 4 horas
    const me3 = await getMe()
    expect(me3.plan.status).toBe("IDDLE")
  })
})
