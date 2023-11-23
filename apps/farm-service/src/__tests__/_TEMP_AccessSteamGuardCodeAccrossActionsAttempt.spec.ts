import {
  GuestPlan,
  IDGenerator,
  PlanUsage,
  SilverPlan,
  SteamAccount,
  SteamAccountCredentials,
  Usage,
  User,
} from "core"

import { FarmingUsersStorage, AllUsersClientsStorage } from "~/application/services"
import { Publisher } from "~/infra/queue"
import { UsersRepositoryInMemory, UsersInMemory } from "../infra/repository"
import { FarmGamesController } from "~/presentation/controllers"
import { makeUser } from "~/utils/makeUser"
import { SteamUserMock } from "~/infra/services/SteamUserMock"
import SteamUser from "steam-user"
import { SteamBuilder } from "~/contracts"
import { promiseHandler } from "~/presentation/controllers/promiseHandler"

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

let farmingUsersStorage: FarmingUsersStorage
let publisher: Publisher
let usersRepository: UsersRepositoryInMemory
let startFarmController: FarmGamesController
let userSteamClientsStorage: AllUsersClientsStorage
let me: User
let friend: User
let me_steamAcount: SteamAccount
const idGenerator: IDGenerator = {
  makeID: () => "ID",
}

const log = console.log

beforeAll(async () => {
  farmingUsersStorage = new FarmingUsersStorage()
  publisher = new Publisher()
  usersRepository = new UsersRepositoryInMemory(new UsersInMemory())
  userSteamClientsStorage = new AllUsersClientsStorage(publisher, {
    create: () => new SteamUserMock(validSteamAccounts, true) as unknown as SteamUser,
  })
  startFarmController = new FarmGamesController(
    farmingUsersStorage,
    publisher,
    usersRepository,
    userSteamClientsStorage
  )
  me = makeUser(USER_ID, USERNAME)
  me_steamAcount = SteamAccount.create({
    credentials: SteamAccountCredentials.create({
      accountName: USER_STEAM_ACCOUNT,
      password: "steam_account_admin_pass",
    }),
    idGenerator,
  })
  me.addSteamAccount(me_steamAcount)
  friend = makeUser(FRIEND_ID, FRIEND)
  await usersRepository.create(me)
  await usersRepository.create(friend)
})

function performAttemptToFarm() {
  return promiseHandler(
    startFarmController.handle({
      payload: {
        userId: USER_ID,
        accountName: USER_STEAM_ACCOUNT,
        gamesID: [10892],
      },
    })
  )
}

beforeEach(() => {
  console.log = () => {}
})

test("should ask for the steam guard code", async () => {
  const response = await performAttemptToFarm()

  const { userSteamClients } = userSteamClientsStorage.get(USER_ID)
  const { steamAccountClient: sac } = userSteamClients.getAccountClient(USER_STEAM_ACCOUNT)
  expect((sac.client as unknown as SteamUserMock).steamGuardCode).toBeNull()

  expect(response).toStrictEqual({
    status: 202,
    json: { message: "SteamClient: Steam Guard required! Sendind code to your phone." },
  })
})

test("should call function that sets the steam guard code to the client instance", async () => {
  const { userSteamClients } = userSteamClientsStorage.get(USER_ID)
  const { steamAccountClient: sac } = userSteamClients.getAccountClient(USER_STEAM_ACCOUNT)

  expect((sac.client as unknown as SteamUserMock).steamGuardCode).toBeNull()
  const handler = sac.getLastHandler(USER_STEAM_ACCOUNT, "steamGuard")
  expect(handler).toBeTruthy()
  console.log(handler)
  handler("998776")
  expect((sac.client as unknown as SteamUserMock).steamGuardCode).toBe("998776")
})

test("NOW should not ask for the steamGuard, even being on mobile, since last action saved the steam guard", async () => {
  console.log = log
  const response = await performAttemptToFarm()
  const { userSteamClients } = userSteamClientsStorage.get(USER_ID)
  const { steamAccountClient: sac } = userSteamClients.getAccountClient(USER_STEAM_ACCOUNT)
  expect((sac.client as unknown as SteamUserMock).isMobile()).toBeTruthy()

  expect(response).toStrictEqual({
    status: 200,
    json: { message: "Iniciando farm." },
  })
})
