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

import { FarmingUsersStorage, UserSteamClientsStorage } from "~/application/services"
import { Publisher } from "~/infra/queue"
import { UsersRepositoryInMemory, UsersInMemory } from "../infra/repository"
import { StartFarmController } from "~/presentation/controllers"
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

let farmingUsersStorage: FarmingUsersStorage
let publisher: Publisher
let usersRepository: UsersRepositoryInMemory
let startFarmController: StartFarmController
let userSteamClientsStorage: UserSteamClientsStorage
let me: User
let friend: User
let me_steamAcount: SteamAccount
const idGenerator: IDGenerator = {
  makeID: () => "ID",
}

beforeEach(async () => {
  farmingUsersStorage = new FarmingUsersStorage()
  publisher = new Publisher()
  usersRepository = new UsersRepositoryInMemory(new UsersInMemory())
  userSteamClientsStorage = new UserSteamClientsStorage(publisher, {
    create: () => new SteamUserMock([]) as unknown as SteamUser,
  })
  startFarmController = new StartFarmController(
    farmingUsersStorage,
    publisher,
    usersRepository,
    userSteamClientsStorage
  )
  me = makeUser(USER_ID, USERNAME)
  me_steamAcount = SteamAccount.create({
    credentials: SteamAccountCredentials.create({
      accountName: USER_STEAM_ACCOUNT,
      password: "123",
    }),
    idGenerator,
  })
  me.addSteamAccount(me_steamAcount)
  friend = makeUser(FRIEND_ID, FRIEND)
  await usersRepository.create(me)
  await usersRepository.create(friend)
})

describe("StartFarmController test suite", () => {
  test("should start the farm", async () => {
    const response = await promiseHandler(
      startFarmController.handle({
        payload: {
          userId: USER_ID,
          accountName: USER_STEAM_ACCOUNT,
          gamesID: [10],
        },
      })
    )

    expect(response).toStrictEqual({
      status: 200,
      json: { message: "Iniciando farm." },
    })
  })

  test("should return 404 when not registered user is provided", async () => {
    const response = await promiseHandler(
      startFarmController.handle({
        payload: {
          userId: "RANDOM_ID_SDFIWI",
          accountName: USER_STEAM_ACCOUNT,
          gamesID: [10],
        },
      })
    )

    expect(response).toStrictEqual({
      status: 404,
      json: {
        message: "Usuário não encontrado.",
      },
    })
  })

  test("should reject if steam account don't exists", async () => {
    const response = await promiseHandler(
      startFarmController.handle({
        payload: {
          userId: USER_ID,
          accountName: "RANDOM_STEAM_ACCOUNT_ID",
          gamesID: [10],
        },
      })
    )

    expect(response).toStrictEqual({
      status: 400,
      json: {
        message: "Steam Account não foi registrada.",
      },
    })
  })

  test("should reject if the provided plan is type usage and don't have more usage left", async () => {
    const reachedUserID = "user_ID"
    const reachedUserSteamAccountName = "REACHED"
    const reachedPlan = GuestPlan.create({
      ownerId: reachedUserID,
    })
    const allUsage = Usage.create({
      amountTime: 21600,
      createdAt: new Date("2023-06-10T10:00:00Z"),
      plan_id: reachedPlan.id_plan,
    })
    reachedPlan.use(allUsage)
    const user = makeUser(reachedUserID, "used_user", reachedPlan)
    user.addSteamAccount(
      SteamAccount.create({
        credentials: SteamAccountCredentials.create({
          accountName: reachedUserSteamAccountName,
          password: "123",
        }),
        idGenerator,
      })
    )
    await usersRepository.create(user)
    const dbUser = await usersRepository.getByID(reachedUserID)
    expect(dbUser?.steamAccounts).toHaveLength(1)
    expect(dbUser?.plan).toBeInstanceOf(GuestPlan)
    expect((dbUser?.plan as PlanUsage).getUsageLeft()).toBe(0)
    expect((dbUser?.plan as PlanUsage).getUsageTotal()).toBe(21600)
    const response = await promiseHandler(
      startFarmController.handle({
        payload: {
          userId: reachedUserID,
          accountName: reachedUserSteamAccountName,
          gamesID: [10],
        },
      })
    )

    expect(response).toStrictEqual({
      status: 400,
      json: {
        message: "Seu plano não possui mais uso disponível.",
      },
    })
  })

  test("should run the farm if the plan is type infinity", async () => {
    me.assignPlan(
      SilverPlan.create({
        ownerId: me.id_user,
      })
    )
    await usersRepository.update(me)
    const response = await promiseHandler(
      startFarmController.handle({
        payload: {
          userId: USER_ID,
          accountName: USER_STEAM_ACCOUNT,
          gamesID: [10],
        },
      })
    )

    expect(response).toStrictEqual({
      status: 200,
      json: { message: "Iniciando farm." },
    })
  })

  test("should return message informing if no new games were added", async () => {
    const response1 = await promiseHandler(
      startFarmController.handle({
        payload: {
          userId: USER_ID,
          accountName: USER_STEAM_ACCOUNT,
          gamesID: [1, 2, 3],
        },
      })
    )

    expect(response1).toStrictEqual({
      status: 200,
      json: { message: "Iniciando farm." },
    })

    const response = await promiseHandler(
      startFarmController.handle({
        payload: {
          userId: USER_ID,
          accountName: USER_STEAM_ACCOUNT,
          gamesID: [1, 2, 3],
        },
      })
    )

    expect(response).toStrictEqual({
      status: 200,
      json: {
        message: "Nenhum novo game adicionado ao farm.",
      },
    })
  })

  test("should stop the farming successfully", async () => {
    await promiseHandler(
      startFarmController.handle({
        payload: {
          userId: USER_ID,
          accountName: USER_STEAM_ACCOUNT,
          gamesID: [1, 2, 3],
        },
      })
    )
    const response = await promiseHandler(
      startFarmController.handle({
        payload: {
          userId: USER_ID,
          accountName: USER_STEAM_ACCOUNT,
          gamesID: [],
        },
      })
    )

    expect(response).toStrictEqual({
      status: 200,
      json: {
        message: "Farm pausado.",
      },
    })
  })
})
