import { IDGenerator, PlanUsage, SteamAccount, SteamAccountCredentials, User, UsersRepository } from "core"
import SteamUser from "steam-user"

import {
  AllUsersClientsStorage,
  FarmUsageService,
  UsersSACsFarmingClusterStorage,
} from "~/application/services"
import { Publisher } from "~/infra/queue"
import {
  SteamAccountClientStateCacheInMemory,
  UsersInMemory,
  UsersRepositoryInMemory,
} from "~/infra/repository"
import { SteamUserMock } from "~/infra/services"
import { FarmGamesController, StopFarmController, promiseHandler } from "~/presentation/controllers"
import { makeUser } from "~/utils/makeUser"

const password = "123"
const validSteamAccounts = [{ accountName: "paco", password }]

const ME_ID = "123"
const FRIEND_ID = "ABC"
const ME_ACCOUNTNAME = "paco"
const FRIEND = "matheus"
const ME_USERNAME = "vrsl"

let publisher: Publisher
let usersClusterStorage: UsersSACsFarmingClusterStorage
let usersMemory: UsersInMemory
let usersRepository: UsersRepository
let me: User
let friend: User
let allUsersClientsStorage: AllUsersClientsStorage
let sacStateCacheRepository: SteamAccountClientStateCacheInMemory
let me_steamAccount: SteamAccount
const idGenerator: IDGenerator = {
  makeID: () => "ID",
}

let farmGamesController: FarmGamesController

const now = new Date("2023-06-10T10:00:00Z")

function makeSteamAccount(ownerId: string, accountName: string) {
  return SteamAccount.create({
    credentials: SteamAccountCredentials.create({
      accountName,
      password,
    }),
    idGenerator,
    ownerId,
  })
}

beforeEach(async () => {
  const steamBuilder = {
    create: () => new SteamUserMock(validSteamAccounts) as unknown as SteamUser,
  }
  usersMemory = new UsersInMemory()
  usersClusterStorage = new UsersSACsFarmingClusterStorage()
  publisher = new Publisher()
  usersRepository = new UsersRepositoryInMemory(usersMemory)
  me_steamAccount = makeSteamAccount(ME_ID, ME_ACCOUNTNAME)
  me = makeUser(ME_ID, ME_USERNAME)
  me.addSteamAccount(me_steamAccount)
  friend = makeUser(FRIEND_ID, FRIEND)
  allUsersClientsStorage = new AllUsersClientsStorage(publisher, steamBuilder)
  sacStateCacheRepository = new SteamAccountClientStateCacheInMemory()
  farmGamesController = new FarmGamesController({
    allUsersClientsStorage,
    publisher,
    sacStateCacheRepository,
    usersClusterStorage,
    usersRepository,
  })
  await usersRepository.create(me)
  await usersRepository.create(friend)
})

afterEach(() => {
  publisher.observers = []
})

test("should reject is not registered user is provided", async () => {
  const stopFarmController = new StopFarmController(usersClusterStorage, usersRepository)
  const { status, json } = await stopFarmController.handle({
    payload: {
      userId: "RANDOM_ID",
      accountName: ME_ACCOUNTNAME,
    },
  })

  expect(json).toMatchObject({
    message: "Usuário não encontrado.",
  })
  expect(status).toBe(404)
  expect(usersClusterStorage.getAccountsStatus()).toStrictEqual({})
})

test("should reject if user is not farming", async () => {
  const stopFarmController = new StopFarmController(usersClusterStorage, usersRepository)
  const { status, json } = await promiseHandler(
    stopFarmController.handle({
      payload: {
        userId: ME_ID,
        accountName: ME_ACCOUNTNAME,
      },
    })
  )

  expect(json).toMatchObject({
    message: "Usuário não possui contas farmando.",
  })
  expect(status).toBe(402)
  expect(usersClusterStorage.getAccountsStatus()).toStrictEqual({})
})

describe("Account Name farming test suite", () => {
  beforeEach(async () => {
    const { status } = await promiseHandler(
      farmGamesController.handle({
        payload: {
          accountName: ME_ACCOUNTNAME,
          gamesID: [99],
          userId: ME_ID,
        },
      })
    )
    expect(status).toBe(200)
  })

  test("should delete farming user from storage after stop farm", async () => {
    const stopFarmController = new StopFarmController(usersClusterStorage, usersRepository)
    const { status, json } = await promiseHandler(
      stopFarmController.handle({
        payload: {
          userId: ME_ID,
          accountName: ME_ACCOUNTNAME,
        },
      })
    )

    console.log({ status, json })

    expect(json).toBeNull()
    expect(status).toBe(200)
    expect(usersClusterStorage.getAccountsStatus()).toStrictEqual({
      [ME_USERNAME]: {
        [ME_ACCOUNTNAME]: "IDDLE",
      },
    })
  })
})
