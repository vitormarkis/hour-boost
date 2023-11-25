import { AddSteamAccount, IDGenerator, User, UsersDAO, UsersRepository } from "core"
import SteamUser from "steam-user"
import { AllUsersClientsStorage, FarmingUsersStorage, IFarmingUsersStorage } from "~/application/services"
import { SteamBuilder } from "~/contracts"
import { UsersDAOInMemory } from "~/infra/dao"
import { Publisher } from "~/infra/queue"
import { UsersInMemory, UsersRepositoryInMemory } from "~/infra/repository"
import { SteamUserMock } from "~/infra/services/SteamUserMock"
import { AddSteamAccountController, FarmGamesController } from "~/presentation/controllers"
import { promiseHandler } from "~/presentation/controllers/promiseHandler"
import { makeUser } from "~/utils/makeUser"

const USER_STEAM_ACCOUNT_NAME = "user1"
const USER_ID = "123"
const USER_USERNAME = "versale"

let usersMemory: UsersInMemory
let usersRepository: UsersRepository
let publisher: Publisher
let steamBuilder: SteamBuilder
let idGenerator: IDGenerator
let addSteamAccount: AddSteamAccount
let allUsersClientsStorage: AllUsersClientsStorage
let usersDAO: UsersDAO
let user: User
let farmingUsersStorage: IFarmingUsersStorage

const validSteamAccounts = [
  { accountName: "user1", password: "user1_PASS" },
  { accountName: "user2", password: "xx" },
  { accountName: "user3", password: "xx" },
]

const log = console.log

beforeEach(async () => {
  console.log = () => {}
  farmingUsersStorage = new FarmingUsersStorage()
  publisher = new Publisher()
  steamBuilder = {
    create: () => new SteamUserMock(validSteamAccounts) as unknown as SteamUser,
  }
  usersMemory = new UsersInMemory()
  usersRepository = new UsersRepositoryInMemory(usersMemory)
  idGenerator = { makeID: () => "998" }
  addSteamAccount = new AddSteamAccount(usersRepository, idGenerator)
  allUsersClientsStorage = new AllUsersClientsStorage(publisher, steamBuilder)
  usersDAO = new UsersDAOInMemory(usersMemory)
  user = makeUser(USER_ID, USER_USERNAME)
  await usersRepository.create(user)
})

describe("should register a new steam account in the storage after addition of a new steam account", () => {
  test("should create user1", async () => {
    const addSteamAccountController = new AddSteamAccountController(
      addSteamAccount,
      allUsersClientsStorage,
      usersDAO
    )

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

    const farmGamesController = new FarmGamesController(
      farmingUsersStorage,
      publisher,
      usersRepository,
      allUsersClientsStorage
    )
    const userx3 = await usersRepository.getByID(USER_ID)
    expect(userx3?.steamAccounts.data).toHaveLength(1)
    console.log = log

    const userSAs = await usersRepository.getByID(USER_ID)
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
})
