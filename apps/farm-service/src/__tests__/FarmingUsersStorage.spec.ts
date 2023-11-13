import { User, PlanType } from "core"
import { FarmingUsersStorage, IFarmService } from "~/application/services"

import { Publisher } from "~/infra/queue"
import { UsersInMemory, UsersRepositoryInMemory } from "~/infra/repository"
import { makeUser } from "~/utils/makeUser"

const USER_ID = "123"
const FRIEND_ID = "ABC"
const USERNAME = "vitormarkis"
const FRIEND = "matheus"

let farmingUsersStorage: FarmingUsersStorage
let publisher: Publisher
let usersRepository: UsersRepositoryInMemory
let me: User
let friend: User

beforeEach(async () => {
  farmingUsersStorage = new FarmingUsersStorage()
  publisher = new Publisher()
  usersRepository = new UsersRepositoryInMemory(new UsersInMemory())
  me = makeUser(USER_ID, USERNAME)
  friend = makeUser(FRIEND_ID, FRIEND)
  await usersRepository.create(me)
  await usersRepository.create(friend)
})

const makeFarmService = (user: User, type: PlanType) =>
  ({
    listFarmingStatusCount: () => ({ FARMING: 0, IDDLE: 0 }),
    startFarm() {
      this.status = "FARMING"
    },
    ownerId: user.id_user,
    username: user.username,
    status: "IDDLE",
    stopFarm() {
      this.status = "IDDLE"
    },
    type,
    user,
  }) as IFarmService

describe("FarmingUsersStorage test suite", () => {
  test("should assign the farm service properly", async () => {
    farmingUsersStorage.add(makeFarmService(me, "USAGE"))
    farmingUsersStorage.add(makeFarmService(friend, "INFINITY"))
    expect(farmingUsersStorage.users.size).toBe(2)
    expect(farmingUsersStorage.get(USERNAME)?.type).toBe("USAGE")
    expect(farmingUsersStorage.get(FRIEND)?.type).toBe("INFINITY")
  })

  test("should list 1 user farming and 1 iddle", async () => {
    expect(farmingUsersStorage.users.size).toBe(0)
    farmingUsersStorage.add(makeFarmService(me, "USAGE")).startFarm()
    farmingUsersStorage.add(makeFarmService(friend, "USAGE")).startFarm()
    farmingUsersStorage.get(USERNAME)?.stopFarm()
    expect(farmingUsersStorage.listFarmingStatusCount()).toStrictEqual({
      FARMING: 1,
      IDDLE: 1,
    })
  })

  test("user status should be iddle when added to the storage", async () => {
    farmingUsersStorage.add(makeFarmService(me, "USAGE"))
    expect(farmingUsersStorage.users.size).toBe(1)
    expect(farmingUsersStorage.get(USERNAME)?.status).toBe("IDDLE")
  })

  test("user status should be farming after starts farming", async () => {
    farmingUsersStorage.add(makeFarmService(me, "USAGE")).startFarm()
    expect(farmingUsersStorage.users.size).toBe(1)
    expect(farmingUsersStorage.get(USERNAME)?.status).toBe("FARMING")
  })

  test("users should stay in the storage after stop farm", async () => {
    farmingUsersStorage.add(makeFarmService(me, "USAGE")).startFarm()
    farmingUsersStorage.add(makeFarmService(friend, "INFINITY")).startFarm()
    farmingUsersStorage.get(USERNAME)?.stopFarm()
    farmingUsersStorage.get(FRIEND)?.stopFarm()
    expect(farmingUsersStorage.users.size).toBe(2)
    expect(farmingUsersStorage.get(USERNAME)?.status).toBe("IDDLE")
    expect(farmingUsersStorage.get(FRIEND)?.status).toBe("IDDLE")
    expect(farmingUsersStorage.get(USERNAME)?.type).toBe("USAGE")
    expect(farmingUsersStorage.get(FRIEND)?.type).toBe("INFINITY")
  })
})
