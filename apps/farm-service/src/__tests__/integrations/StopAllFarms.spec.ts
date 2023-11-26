import { User, SteamAccount, IDGenerator, SteamAccountCredentials, UsersDAO, DiamondPlan } from "core"
import SteamUser from "steam-user"
import { FarmingUsersStorage, AllUsersClientsStorage } from "~/application/services"
import { UsersDAOInMemory } from "~/infra/dao"
import { Publisher } from "~/infra/queue"
import { UsersRepositoryInMemory, UsersInMemory } from "~/infra/repository"
import { SteamUserMock } from "~/infra/services/SteamUserMock"
import { FarmGamesController } from "~/presentation/controllers"
import { makeUser } from "~/utils/makeUser"

const USER_ID = "vitor_id"
const USERNAME = "vitormarkis"
const ACCOUNT_NAME = "steam_account"
const ACCOUNT_NAME_2 = "steam_account_2"
const FRIEND_ID = "matheus_id"
const FRIEND_USERNAME = "matheus"
const FRIEND_ACCOUNT_NAME = "matheus_sa"

const validSteamAccounts = [
  {
    accountName: "steam_account",
    password: "steam_account_admin_pass",
  },
  {
    accountName: "matheus_sa",
    password: "matheus_admin_pass",
  },
  {
    accountName: "steam_account_2",
    password: "steam_account_2_admin_pass",
  },
]

let farmingUsersStorage: FarmingUsersStorage
let publisher: Publisher
let usersRepository: UsersRepositoryInMemory
let farmGamesController: FarmGamesController
let userSteamClientsStorage: AllUsersClientsStorage
let usersMemory: UsersInMemory
let usersDAO: UsersDAO
let me: User
let friend: User
let me_steamAcount: SteamAccount
let me_steamAcount2: SteamAccount
let friend_steamAcount: SteamAccount
const idGenerator: IDGenerator = {
  makeID: () => "ID",
}

const log = console.log
// console.log = () => {}

beforeEach(async () => {
  farmingUsersStorage = new FarmingUsersStorage()
  publisher = new Publisher()
  usersMemory = new UsersInMemory()
  usersRepository = new UsersRepositoryInMemory(usersMemory)
  usersDAO = new UsersDAOInMemory(usersMemory)
  userSteamClientsStorage = new AllUsersClientsStorage(publisher, {
    create: () => new SteamUserMock(validSteamAccounts) as unknown as SteamUser,
  })
  farmGamesController = new FarmGamesController(
    farmingUsersStorage,
    publisher,
    usersRepository,
    userSteamClientsStorage
  )
  me = makeUser(USER_ID, USERNAME)
  me.assignPlan(
    DiamondPlan.create({
      ownerId: me.id_user,
    })
  )
  me_steamAcount = SteamAccount.create({
    credentials: SteamAccountCredentials.create({
      accountName: ACCOUNT_NAME,
      password: "steam_account_admin_pass",
    }),
    ownerId: me.id_user,
    idGenerator,
  })
  me_steamAcount2 = SteamAccount.create({
    credentials: SteamAccountCredentials.create({
      accountName: ACCOUNT_NAME_2,
      password: "steam_account_2_admin_pass",
    }),
    ownerId: me.id_user,
    idGenerator,
  })
  me.addSteamAccount(me_steamAcount)
  me.addSteamAccount(me_steamAcount2)
  friend = makeUser(FRIEND_ID, FRIEND_USERNAME)
  friend_steamAcount = SteamAccount.create({
    credentials: SteamAccountCredentials.create({
      accountName: FRIEND_ACCOUNT_NAME,
      password: "matheus_admin_pass",
    }),
    ownerId: friend.id_user,
    idGenerator,
  })
  friend.addSteamAccount(friend_steamAcount)
  await usersRepository.create(me)
  await usersRepository.create(friend)
})

test("should stop all farms", async () => {
  // console.log = () => {}
  // console.log = log
  await farmGamesController.handle({
    payload: { accountName: ACCOUNT_NAME, gamesID: [109230], userId: USER_ID },
  })
  await farmGamesController.handle({
    payload: { accountName: ACCOUNT_NAME_2, gamesID: [109230], userId: USER_ID },
  })
  await farmGamesController.handle({
    payload: { accountName: FRIEND_ACCOUNT_NAME, gamesID: [109230], userId: FRIEND_ID },
  })

  expect(userSteamClientsStorage.listUsers()).toStrictEqual({
    vitor_id: {
      steam_account: {
        farming: true,
      },
      steam_account_2: {
        farming: true,
      },
    },
    matheus_id: {
      matheus_sa: {
        farming: true,
      },
    },
  })
})
