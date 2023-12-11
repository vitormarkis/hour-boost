import {
  IDGenerator,
  PlanRepository,
  SteamAccount,
  SteamAccountClientStateCacheRepository,
  SteamAccountCredentials,
  User,
} from "core"

import SteamUser from "steam-user"
import { AllUsersClientsStorage, UsersSACsFarmingClusterStorage } from "~/application/services"
import { Publisher } from "~/infra/queue"
import { SteamUserMock } from "~/infra/services/SteamUserMock"
import { FarmGamesController } from "~/presentation/controllers"
import { promiseHandler } from "~/presentation/controllers/promiseHandler"
import { makeUser } from "~/utils/makeUser"
import { sleep } from "~/utils"
import {
  PlanRepositoryInMemory,
  SteamAccountClientStateCacheInMemory,
  UsersInMemory,
  UsersRepositoryInMemory,
} from "~/infra/repository"

const USER_ID = "123"
const USER_STEAM_ACCOUNT = "steam_account"
const USERNAME = "vitormarkis"
const FRIEND_ID = "ABC"
const FRIEND = "matheus"

const validSteamAccounts = [
  {
    accountName: "steam_account",
    password: "steam_account_admin_pass",
  },
  {
    accountName: "REACHED",
    password: "REACHED_admin_pass",
  },
]

let usersMemory: UsersInMemory
let publisher: Publisher
let usersRepository: UsersRepositoryInMemory
let startFarmController: FarmGamesController
let allUsersClientsStorage: AllUsersClientsStorage
let me: User
let friend: User
let me_steamAcount: SteamAccount
let sacStateCacheRepository: SteamAccountClientStateCacheRepository
let planRepository: PlanRepository
let usersClusterStorage: UsersSACsFarmingClusterStorage
const idGenerator: IDGenerator = {
  makeID: () => "ID",
}

const log = console.log

beforeEach(async () => {
  usersMemory = new UsersInMemory()
  publisher = new Publisher()
  usersRepository = new UsersRepositoryInMemory(usersMemory)
  allUsersClientsStorage = new AllUsersClientsStorage(publisher, {
    create: () => new SteamUserMock(validSteamAccounts, true) as unknown as SteamUser,
  })
  planRepository = new PlanRepositoryInMemory(usersMemory)
  sacStateCacheRepository = new SteamAccountClientStateCacheInMemory()
  usersClusterStorage = new UsersSACsFarmingClusterStorage()
  startFarmController = new FarmGamesController({
    publisher,
    usersRepository,
    allUsersClientsStorage,
    sacStateCacheRepository,
    usersClusterStorage,
    planRepository,
  })
  me = makeUser(USER_ID, USERNAME)
  me_steamAcount = SteamAccount.create({
    credentials: SteamAccountCredentials.create({
      accountName: USER_STEAM_ACCOUNT,
      password: "steam_account_admin_pass",
    }),
    idGenerator,
    ownerId: me.id_user,
  })
  me.addSteamAccount(me_steamAcount)
  friend = makeUser(FRIEND_ID, FRIEND)
  await usersRepository.create(me)
  await usersRepository.create(friend)
  console.log = () => {}
})

test.only("should ask for the steam guard code", async () => {
  const response = await promiseHandler(
    startFarmController.handle({
      payload: {
        userId: USER_ID,
        accountName: USER_STEAM_ACCOUNT,
        gamesID: [10892],
      },
    })
  )

  const SACs1 = allUsersClientsStorage.get(USER_ID)
  const { steamAccountClient: sac1 } = SACs1.userSteamClients.getAccountClient(USER_STEAM_ACCOUNT)
  expect(sac1.getLastArguments("steamGuard")).toHaveLength(3)
  expect((sac1.client as unknown as SteamUserMock).steamGuardCode).toBeUndefined()

  expect(response).toStrictEqual({
    status: 202,
    json: { message: "Steam Guard requerido. Enviando para seu celular." },
  })

  // should call function that sets the steam guard code to the client instance
  const SACs2 = allUsersClientsStorage.get(USER_ID)
  const { steamAccountClient: sac2 } = SACs2.userSteamClients.getAccountClient(USER_STEAM_ACCOUNT)

  expect((sac2.client as unknown as SteamUserMock).steamGuardCode).toBeUndefined()
  const [_, setCode] = sac2.getLastArguments("steamGuard")
  setCode("998776")
  await sleep(0.1)
  expect((sac2.client as unknown as SteamUserMock).steamGuardCode).toBe("998776")

  // NOW should not ask for the steamGuard, even being on mobile, since last action saved the steam guard
  console.log = log
  let response2 = await promiseHandler(
    startFarmController.handle({
      payload: {
        userId: USER_ID,
        accountName: USER_STEAM_ACCOUNT,
        gamesID: [10892],
      },
    })
  )
  const { userSteamClients } = allUsersClientsStorage.get(USER_ID)
  const { steamAccountClient: sac } = userSteamClients.getAccountClient(USER_STEAM_ACCOUNT)
  expect((sac.client as unknown as SteamUserMock).isMobile()).toBeTruthy()

  expect(response2).toStrictEqual({
    status: 200,
    json: { message: "Iniciando farm." },
  })
})
