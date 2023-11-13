import { StartFarmController } from "../presentation/controllers"
import { Publisher } from "../infra/queue"
import { UsersInMemory, UsersRepositoryInMemory } from "../infra/repository"
import { makeUser } from "../utils/makeUser"
import { PlanType, User } from "core"
import { FarmingUsersStorage } from "~/application/services"

const USER_ID = "123"
const FRIEND_ID = "ABC"
const USERNAME = "vitormarkis"
const FRIEND = "matheus"

let farmingUsersStorage: FarmingUsersStorage
let publisher: Publisher
let usersRepository: UsersRepositoryInMemory
let startFarmController: StartFarmController
let me: User
let friend: User

beforeEach(async () => {
  farmingUsersStorage = new FarmingUsersStorage()
  publisher = new Publisher()
  usersRepository = new UsersRepositoryInMemory(new UsersInMemory())
  startFarmController = new StartFarmController(farmingUsersStorage, publisher, usersRepository)
  me = makeUser(USER_ID, USERNAME)
  friend = makeUser(FRIEND_ID, FRIEND)
  await usersRepository.create(me)
  await usersRepository.create(friend)
})

function useCase(userId: string) {
  return startFarmController.handle({
    payload: {
      userId,
    },
  })
}

describe("StartFarmController test suite", () => {
  test("should return 404 when not registered user is provided", async () => {
    const response = await useCase("RANDOM_ID_SDFIWI")

    expect(response).toStrictEqual({
      status: 404,
      json: {
        message: "Usuário não encontrado.",
      },
    })
  })

  test("should warn when user is already farming", async () => {
    await useCase(USER_ID)
    const response = await useCase(USER_ID)

    expect(response).toStrictEqual({
      status: 400,
      json: {
        message: "Usuário já está farmando.",
      },
    })
  })

  test("should return succcess after user start farm again after break", async () => {
    await useCase(USER_ID)
    farmingUsersStorage.get(USERNAME)?.stopFarm()
    const response = await useCase(USER_ID)

    expect(farmingUsersStorage.users.size).toBe(1)

    expect(response).toStrictEqual({
      status: 200,
      json: null,
    })
  })
})
