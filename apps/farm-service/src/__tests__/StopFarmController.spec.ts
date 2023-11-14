import { PlanUsage, User, UsersRepository } from "core"

import { FarmUsageService, FarmingUsersStorage, IFarmingUsersStorage } from "~/application/services"
import { Publisher } from "~/infra/queue"
import { UsersInMemory, UsersRepositoryInMemory } from "~/infra/repository"
import { StopFarmController } from "~/presentation/controllers"
import { makeUser } from "~/utils/makeUser"

const USER_ID = "123"
const FRIEND_ID = "ABC"
const USERNAME = "vitormarkis"
const FRIEND = "matheus"

let farmingUsersStorage: IFarmingUsersStorage
let publisher: Publisher
let usersRepository: UsersRepository
let me: User
let friend: User

beforeEach(async () => {
  const usersMemory = new UsersInMemory()
  farmingUsersStorage = new FarmingUsersStorage()
  publisher = new Publisher()
  usersRepository = new UsersRepositoryInMemory(usersMemory)

  me = makeUser(USER_ID, USERNAME)
  friend = makeUser(FRIEND_ID, FRIEND)
  await usersRepository.create(me)
  await usersRepository.create(friend)
})

afterEach(() => {
  publisher.observers = []
})

describe("StopFarmController test suite", () => {
  test("should reject is not registered user is provided", async () => {
    const stopFarmController = new StopFarmController(farmingUsersStorage, publisher, usersRepository)
    const { status, json } = await stopFarmController.handle({
      payload: {
        userId: "RANDOM_ID",
      },
    })

    expect(json).toMatchObject({
      message: "Usuário não encontrado.",
    })
    expect(status).toBe(404)
    expect(farmingUsersStorage.users.size).toBe(0)
  })

  test("should reject if user is not farming", async () => {
    const stopFarmController = new StopFarmController(farmingUsersStorage, publisher, usersRepository)
    const { status, json } = await stopFarmController.handle({
      payload: {
        userId: USER_ID,
      },
    })

    expect(json).toMatchObject({
      message: "Usuário não está farmando.",
    })
    expect(status).toBe(400)
    expect(farmingUsersStorage.users.size).toBe(0)
  })

  test("should delete farming user from storage after stop farm", async () => {
    farmingUsersStorage.add(new FarmUsageService(publisher, me.plan as PlanUsage, me.username)).startFarm()
    const stopFarmController = new StopFarmController(farmingUsersStorage, publisher, usersRepository)
    const { status, json } = await stopFarmController.handle({
      payload: {
        userId: USER_ID,
      },
    })

    expect(json).toBeNull()
    expect(status).toBe(200)
    expect(farmingUsersStorage.users.size).toBe(0)
  })
})
