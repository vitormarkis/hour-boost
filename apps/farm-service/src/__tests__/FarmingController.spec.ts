import { FarmingController } from "../domain/service/FarmingController"
import { UsersRepositoryInMemory } from "../infra/repository/UsersRepositoryInMemory"
import { Publisher } from "../infra/queue/Publisher"
import { ActiveStatus, GuestPlan, User, UserRole } from "core"

const USER_ID = "1234567"
const OTHER_USER_ID = "ABCD"

let publisher: Publisher
let usersRepository: UsersRepositoryInMemory
let farmingController: FarmingController

beforeEach(() => {
  publisher = new Publisher()
  usersRepository = new UsersRepositoryInMemory()
  farmingController = new FarmingController(publisher, usersRepository)
})

test("should throw if id of no user is provided", async () => {
  expect(farmingController.startFarm(USER_ID)).rejects.toThrow("User not found")
})

test("should have no users farming when start", async () => {
  expect(farmingController.farmingUsers.size).toBe(0)
})

test("should append farming user to farming users map", async () => {
  expect(farmingController.farmingUsers.size).toBe(0)
  await usersRepository.create(makeUser(USER_ID, "vitormarkis"))
  farmingController.startFarm(USER_ID)
  await new Promise(res => setTimeout(res, 10))
  expect(farmingController.farmingUsers.size).toBe(1)
})

test("should keep user after stop farm", async () => {
  expect(farmingController.farmingUsers.size).toBe(0)
  await usersRepository.create(makeUser(USER_ID, "vitormarkis"))
  farmingController.startFarm(USER_ID)
  await new Promise(res => setTimeout(res, 10))
  expect(farmingController.farmingUsers.size).toBe(1)
  farmingController.stopFarm(USER_ID)
  expect(farmingController.farmingUsers.size).toBe(1)
})

test("should list 1 user farming and 1 iddle", async () => {
  expect(farmingController.farmingUsers.size).toBe(0)
  await usersRepository.create(makeUser(USER_ID, "vitormarkis"))
  await usersRepository.create(makeUser(OTHER_USER_ID, "matheusx"))
  farmingController.startFarm(USER_ID)
  farmingController.startFarm(OTHER_USER_ID)
  farmingController.stopFarm(OTHER_USER_ID)
  await new Promise(res => setTimeout(res, 1))
  expect(farmingController.listFarmingStatusCount()).toStrictEqual({
    FARMING: 1,
    IDDLE: 1,
  })
})

test("should list 2 farming after them stop and go farm again", async () => {
  expect(farmingController.farmingUsers.size).toBe(0)
  await usersRepository.create(makeUser(USER_ID, "vitormarkis"))
  await usersRepository.create(makeUser(OTHER_USER_ID, "matheusx"))
  farmingController.startFarm(USER_ID)
  farmingController.startFarm(OTHER_USER_ID)
  farmingController.stopFarm(USER_ID)
  farmingController.stopFarm(OTHER_USER_ID)
  farmingController.startFarm(USER_ID)
  farmingController.startFarm(OTHER_USER_ID)
  await new Promise(res => setTimeout(res, 1))
  expect(farmingController.listFarmingStatusCount()).toStrictEqual({
    FARMING: 2,
    IDDLE: 0,
  })
})

test("should not list user when he is creted, only when he start farming", async () => {
  expect(farmingController.farmingUsers.size).toBe(0)
  await usersRepository.create(makeUser(USER_ID, "vitormarkis"))
  expect(farmingController.listFarmingStatusCount()).toStrictEqual({
    FARMING: 0,
    IDDLE: 0,
  })
  farmingController.startFarm(USER_ID)
  await new Promise(res => setTimeout(res, 1))
  expect(farmingController.listFarmingStatusCount()).toStrictEqual({
    FARMING: 1,
    IDDLE: 0,
  })
  farmingController.stopFarm(USER_ID)
  await new Promise(res => setTimeout(res, 1))
  expect(farmingController.listFarmingStatusCount()).toStrictEqual({
    FARMING: 0,
    IDDLE: 1,
  })
})

const makeUser = (userId: string, username: string) => {
  return User.restore({
    id_user: userId,
    email: "",
    plan: GuestPlan.create({
      ownerId: userId,
    }),
    profilePic: "",
    purchases: [],
    role: new UserRole(),
    status: new ActiveStatus(),
    steamAccounts: [],
    username: username,
  })
}
