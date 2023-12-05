import { PlanRepository, PlanType, PlanUsage, User } from "core"

import {
  FarmInfinityService,
  FarmUsageService,
  FarmingUsersStorage,
  IFarmService,
} from "~/application/services"
import { ChangePlanStatusHandler, PersistUsageHandler } from "~/domain/handler"
import { Publisher } from "~/infra/queue"
import { makeUser } from "~/utils/makeUser"
import { PlanRepositoryInMemory, UsersInMemory, UsersRepositoryInMemory } from "../infra/repository"

const USER_ID = "123"
const FRIEND_ID = "ABC"
const USERNAME = "vitormarkis"
const FRIEND_USERNAME = "matheus"

let farmingUsersStorage: FarmingUsersStorage
let usersRepository: UsersRepositoryInMemory
let me: User
let friend: User
let publisher: Publisher
let planRepository: PlanRepository

beforeEach(async () => {
  farmingUsersStorage = new FarmingUsersStorage()
  publisher = new Publisher()
  const usersMemory = new UsersInMemory()
  usersRepository = new UsersRepositoryInMemory(usersMemory)
  planRepository = new PlanRepositoryInMemory(usersMemory)
  me = makeUser(USER_ID, USERNAME)
  friend = makeUser(FRIEND_ID, FRIEND_USERNAME)
  await usersRepository.create(me)
  await usersRepository.create(friend)
  jest.useFakeTimers()
  publisher.register(new PersistUsageHandler(planRepository))
  publisher.register(new ChangePlanStatusHandler(planRepository))
  publisher.register({
    operation: "plan-usage-expired-mid-farm",
    async notify() {
      console.log("plan usage runned out")
    },
  })
})
afterEach(() => {
  publisher.observers = []
})

afterAll(() => {
  jest.useRealTimers()
})

const makeFarmService = (user: User, plan: PlanUsage) => new FarmUsageService(publisher, plan, user.username)

describe("FarmingUsersStorage test suite", () => {
  test("should keep track of usage left across the farm sessions", async () => {
    const [usageExpiredHandler] = publisher.observers.filter(
      o => o.operation === "plan-usage-expired-mid-farm"
    )
    expect(usageExpiredHandler).toBeTruthy()
    const usageExpiredHandlerSpy = jest.spyOn(usageExpiredHandler, "notify")

    const mePlan = (await planRepository.getById(me.plan.id_plan)) as PlanUsage
    const meFarmingService = makeFarmService(me, mePlan)
    meFarmingService.farmWithAccount("acc1")
    farmingUsersStorage.add(meFarmingService).startFarm()
    jest.advanceTimersByTime(1000 * 60 * 60 * 4) // 4 hours
    farmingUsersStorage.remove(USERNAME)
    expect(usageExpiredHandlerSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "plan-usage-expired-mid-farm",
      })
    )

    const mePlan2 = (await planRepository.getById(me.plan.id_plan)) as PlanUsage
    console.log(mePlan2.usages)
    const meFarmingService2 = makeFarmService(me, mePlan)
    meFarmingService2.farmWithAccount("acc1")
    farmingUsersStorage.add(meFarmingService2).startFarm()
    jest.advanceTimersByTime(1000 * 60 * 60 * 4) // 4 hours
    farmingUsersStorage.remove(USERNAME)
    expect(usageExpiredHandlerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "plan-usage-expired-mid-farm",
      })
    )
  })

  test("should assign the farm service properly", async () => {
    const mePlan = (await planRepository.getById(me.plan.id_plan)) as PlanUsage
    const meFarmingService = makeFarmService(me, mePlan)
    meFarmingService.farmWithAccount("acc1")
    farmingUsersStorage.add(meFarmingService).startFarm()
    farmingUsersStorage.add(
      new FarmInfinityService(publisher, friend.username, friend.plan.id_plan, friend.id_user)
    )
    expect(farmingUsersStorage.users.size).toBe(2)
    expect(farmingUsersStorage.get(USERNAME)?.type).toBe("USAGE")
    expect(farmingUsersStorage.get(FRIEND_USERNAME)?.type).toBe("INFINITY")
  })

  test("should list 1 user farming and 1 iddle", async () => {
    expect(farmingUsersStorage.users.size).toBe(0)
    const mePlan = (await planRepository.getById(me.plan.id_plan)) as PlanUsage
    const friendPlan = (await planRepository.getById(friend.plan.id_plan)) as PlanUsage
    const meFarmingService = makeFarmService(me, mePlan)
    meFarmingService.farmWithAccount("acc1")
    farmingUsersStorage.add(meFarmingService).startFarm()

    const friendFarmingService = makeFarmService(friend, friendPlan)
    friendFarmingService.farmWithAccount("acc1")
    farmingUsersStorage.add(friendFarmingService).startFarm()

    farmingUsersStorage.remove(FRIEND_USERNAME)
    expect(farmingUsersStorage.listFarmingStatusCount()).toStrictEqual({
      FARMING: 1,
      IDDLE: 1,
    })
  })

  test("user status should be iddle when added to the storage", async () => {
    const mePlan = (await planRepository.getById(me.plan.id_plan)) as PlanUsage
    const meFarmingService = makeFarmService(me, mePlan)
    meFarmingService.farmWithAccount("acc1")
    farmingUsersStorage.add(meFarmingService).startFarm()
    expect(farmingUsersStorage.users.size).toBe(1)
    expect(farmingUsersStorage.get(USERNAME)?.status).toBe("FARMING")
  })

  test("user status should be farming after starts farming", async () => {
    const mePlan = (await planRepository.getById(me.plan.id_plan)) as PlanUsage
    const meFarmingService = makeFarmService(me, mePlan)
    meFarmingService.farmWithAccount("acc1")
    farmingUsersStorage.add(meFarmingService).startFarm()
    expect(farmingUsersStorage.users.size).toBe(1)
    expect(farmingUsersStorage.get(USERNAME)?.status).toBe("FARMING")
  })

  test("users should stay in the storage after stop farm", async () => {
    const mePlan = (await planRepository.getById(me.plan.id_plan)) as PlanUsage
    const friendPlan = (await planRepository.getById(friend.plan.id_plan)) as PlanUsage
    const meFarmingService = makeFarmService(me, mePlan)
    meFarmingService.farmWithAccount("acc1")
    farmingUsersStorage.add(meFarmingService).startFarm()
    const friendFarmingService = makeFarmService(friend, friendPlan)
    friendFarmingService.farmWithAccount("acc1")
    farmingUsersStorage.add(friendFarmingService).startFarm()
    const meStop = farmingUsersStorage.remove(USERNAME)
    meStop.stopFarm()
    const friendStop = farmingUsersStorage.remove(FRIEND_USERNAME)
    friendStop.stopFarm()
    expect(farmingUsersStorage.users.size).toBe(0)
    expect(farmingUsersStorage.listFarmingStatusCount()).toStrictEqual({
      FARMING: 0,
      IDDLE: 2,
    })
  })
})
