import { PlanUsage, User, UsersRepository } from "core"

import { FarmUsageService, UsersSACsFarmingClusterStorage } from "~/application/services"
import { Publisher } from "~/infra/queue"
import { StopFarmController } from "~/presentation/controllers"
import { makeUser } from "~/utils/makeUser"
import { UsersInMemory, UsersRepositoryInMemory } from "../infra/repository"

const USER_ID = "123"
const FRIEND_ID = "ABC"
const ACCOUNT_NAME = "vrsl"
const FRIEND = "matheus"

let publisher: Publisher
let usersClusterStorage: UsersSACsFarmingClusterStorage
let usersRepository: UsersRepository
let me: User
let friend: User

beforeEach(async () => {
  const usersMemory = new UsersInMemory()
  const usersClusterStorage = new UsersSACsFarmingClusterStorage()
  publisher = new Publisher()
  usersRepository = new UsersRepositoryInMemory(usersMemory)

  me = makeUser(USER_ID, ACCOUNT_NAME)
  friend = makeUser(FRIEND_ID, FRIEND)
  await usersRepository.create(me)
  await usersRepository.create(friend)
})

afterEach(() => {
  publisher.observers = []
})

describe("StopFarmController test suite", () => {
  test("should reject is not registered user is provided", async () => {
    const stopFarmController = new StopFarmController(usersClusterStorage, publisher, usersRepository)
    const { status, json } = await stopFarmController.handle({
      payload: {
        userId: "RANDOM_ID",
        accountName: ACCOUNT_NAME
      },
    })

    expect(json).toMatchObject({
      message: "Usuário não encontrado.",
    })
    expect(status).toBe(404)
    expect(usersClusterStorage.getAccountsStatus()).toBe(0)
  })

  test("should reject if user is not farming", async () => {
    const stopFarmController = new StopFarmController(usersClusterStorage, publisher, usersRepository)
    const { status, json } = await stopFarmController.handle({
      payload: {
        userId: USER_ID,
      },
    })

    expect(json).toMatchObject({
      message: "Usuário não está farmando.",
    })
    expect(status).toBe(400)
    expect(usersClusterStorage.users.size).toBe(0)
  })

  test("should delete farming user from storage after stop farm", async () => {
    const meFarmingService = new FarmUsageService(publisher, me.plan as PlanUsage, me.username)
    meFarmingService.farmWithAccount("acc1")
    usersClusterStorage.add(meFarmingService).startFarm()
    const stopFarmController = new StopFarmController(usersClusterStorage, publisher, usersRepository)
    const { status, json } = await stopFarmController.handle({
      payload: {
        userId: USER_ID,
      },
    })

    expect(json).toBeNull()
    expect(status).toBe(200)
    expect(usersClusterStorage.users.size).toBe(0)
  })
})
