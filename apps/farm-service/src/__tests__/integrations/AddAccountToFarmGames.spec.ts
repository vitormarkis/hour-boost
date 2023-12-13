import {
  AddSteamAccount,
  IDGenerator,
  PlanRepository,
  SteamAccountClientStateCacheRepository,
  SteamAccountsRepository,
  User,
  UsersDAO,
  UsersRepository,
} from "core"
import SteamUser from "steam-user"
import { AllUsersClientsStorage, UsersSACsFarmingClusterStorage } from "~/application/services"
import { SteamBuilder } from "~/contracts"
import { UsersDAOInMemory } from "~/infra/dao"
import { Publisher } from "~/infra/queue"
import {
  PlanRepositoryInMemory,
  SteamAccountClientStateCacheInMemory,
  SteamAccountsRepositoryInMemory,
  UsersInMemory,
  UsersRepositoryInMemory,
} from "~/infra/repository"
import { SteamUserMock } from "~/infra/services/SteamUserMock"
import { AddSteamAccountController, FarmGamesController } from "~/presentation/controllers"
import { promiseHandler } from "~/presentation/controllers/promiseHandler"
import { makeUser } from "~/utils/makeUser"

const USER_STEAM_ACCOUNT_NAME = "user1"
const USER_ID = "123"
const USER_USERNAME = "versale"

let usersMemory: UsersInMemory
let usersRepository: UsersRepository
let steamAccountsRepository: SteamAccountsRepository
let publisher: Publisher
let steamBuilder: SteamBuilder
let idGenerator: IDGenerator
let addSteamAccount: AddSteamAccount
let usersDAO: UsersDAO
let user: User
let allUsersClientsStorage: AllUsersClientsStorage
let addSteamAccountController: AddSteamAccountController
let sacStateCacheRepository: SteamAccountClientStateCacheRepository
let planRepository: PlanRepository
let usersClusterStorage: UsersSACsFarmingClusterStorage

const validSteamAccounts = [
  { accountName: "user1", password: "user1_PASS" },
  { accountName: "user2", password: "xx" },
  { accountName: "user3", password: "xx" },
]

const log = console.log

beforeEach(async () => {
  console.log = () => {}
  publisher = new Publisher()
  steamBuilder = {
    create: () => new SteamUserMock(validSteamAccounts) as unknown as SteamUser,
  }
  usersMemory = new UsersInMemory()
  usersRepository = new UsersRepositoryInMemory(usersMemory)
  steamAccountsRepository = new SteamAccountsRepositoryInMemory(usersMemory)
  planRepository = new PlanRepositoryInMemory(usersMemory)
  sacStateCacheRepository = new SteamAccountClientStateCacheInMemory()
  usersClusterStorage = new UsersSACsFarmingClusterStorage()
  idGenerator = { makeID: () => "998" }
  addSteamAccount = new AddSteamAccount(usersRepository, steamAccountsRepository, idGenerator)
  allUsersClientsStorage = new AllUsersClientsStorage(publisher, steamBuilder)
  usersDAO = new UsersDAOInMemory(usersMemory)
  user = makeUser(USER_ID, USER_USERNAME)
  await usersRepository.create(user)
  addSteamAccountController = new AddSteamAccountController(
    addSteamAccount,
    allUsersClientsStorage,
    usersDAO,
    steamBuilder,
    publisher
  )
})

describe("should register a new steam account in the storage after addition of a new steam account", () => {
  test("should create user1", async () => {
    const userx1 = await usersRepository.getByID(USER_ID)
    expect(userx1?.steamAccounts.data).toHaveLength(0)
    const { status, json } = await promiseHandler(
      addSteamAccountController.handle({
        payload: {
          accountName: USER_STEAM_ACCOUNT_NAME,
          password: `${USER_STEAM_ACCOUNT_NAME}_PASS`,
          userId: USER_ID,
        },
      })
    )
    const userx2 = await usersRepository.getByID(USER_ID)
    expect(userx2?.steamAccounts.data).toHaveLength(1)

    expect(json?.message).toBe("user1 adicionada com sucesso!")
    expect(status).toBe(201)

    /**
     * test2
     */

    const farmGamesController = new FarmGamesController({
      allUsersClientsStorage,
      publisher,
      sacStateCacheRepository,
      usersClusterStorage,
      usersRepository,
      planRepository,
    })
    const userx3 = await usersRepository.getByID(USER_ID)
    expect(userx3?.steamAccounts.data).toHaveLength(1)
    console.log = log

    await usersRepository.getByID(USER_ID)
    const { status: status2, json: json2 } = await promiseHandler(
      farmGamesController.handle({
        payload: {
          accountName: USER_STEAM_ACCOUNT_NAME,
          gamesID: [1029],
          userId: USER_ID,
        },
      })
    )
    expect(json2?.message).toBe("Iniciando farm.")
    expect(status2).toBe(200)
  })

  test("should ask for steam guard code, set and then remove it from last handler", async () => {
    console.log = log
    console.log(allUsersClientsStorage.listUsers())
    // console.log = () => {}
    const getUserSAC = () =>
      allUsersClientsStorage.getOrThrow(USER_ID).userSteamClients.getAccountClient(USER_STEAM_ACCOUNT_NAME)
        .steamAccountClient
    addSteamAccountController = new AddSteamAccountController(
      addSteamAccount,
      allUsersClientsStorage,
      usersDAO,
      {
        create: () => new SteamUserMock(validSteamAccounts, true) as unknown as SteamUser,
      },
      publisher
    )

    expect(() => getUserSAC()).toThrowError("Esse usuário não possui contas da Steam ativas na plataforma.")
    // expect to not have a client instance of this account before it is added

    const response = await promiseHandler(
      addSteamAccountController.handle({
        payload: {
          accountName: USER_STEAM_ACCOUNT_NAME,
          password: "user1_PASS",
          userId: USER_ID,
        },
      })
    )

    expect(() => getUserSAC()).not.toThrowError(
      "Esse usuário não possui contas da Steam ativas na plataforma."
    )
    // now the user has it's account client

    const sac = getUserSAC()
    console.log(sac.getLastHandler("steamGuard"))
    expect(sac.getLastHandler("steamGuard")).toBeTruthy()
  })
})
