import {
  GuestPlan,
  IDGenerator,
  PlanUsage,
  SilverPlan,
  SteamAccount,
  SteamAccountClientStateCacheRepository,
  SteamAccountCredentials,
  Usage,
  User,
} from "core"

import SteamUser from "steam-user"
import { AllUsersClientsStorage, UsersSACsFarmingClusterStorage } from "~/application/services"
import { Publisher } from "~/infra/queue"
import { FarmGamesController } from "~/presentation/controllers"
import { promiseHandler } from "~/presentation/controllers/promiseHandler"
import { makeUser } from "~/utils/makeUser"
import {
  SteamAccountClientStateCacheInMemory,
  UsersInMemory,
  UsersRepositoryInMemory,
} from "~/infra/repository"
import { SteamUserMock } from "~/infra/services"

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

let usersClusterStorage: UsersSACsFarmingClusterStorage
let publisher: Publisher
let usersRepository: UsersRepositoryInMemory
let sacStateCacheRepository: SteamAccountClientStateCacheRepository
let startFarmController: FarmGamesController
let allUsersClientsStorage: AllUsersClientsStorage
let me: User
let friend: User
let me_steamAcount: SteamAccount
let maxGuestPlanUsage: Usage
const idGenerator: IDGenerator = {
  makeID: () => "ID",
}

const log = console.log
console.log = () => {}

beforeEach(async () => {
  console.log = () => {}
  usersClusterStorage = new UsersSACsFarmingClusterStorage()
  publisher = new Publisher()
  usersRepository = new UsersRepositoryInMemory(new UsersInMemory())
  sacStateCacheRepository = new SteamAccountClientStateCacheInMemory()
  allUsersClientsStorage = new AllUsersClientsStorage(publisher, {
    create: () => new SteamUserMock(validSteamAccounts) as unknown as SteamUser,
  })
  startFarmController = new FarmGamesController({
    publisher,
    usersRepository,
    allUsersClientsStorage,
    sacStateCacheRepository,
    usersClusterStorage,
  })
  me = makeUser(USER_ID, USERNAME)
  me_steamAcount = SteamAccount.create({
    credentials: SteamAccountCredentials.create({
      accountName: USER_STEAM_ACCOUNT,
      password: "steam_account_admin_pass",
    }),
    ownerId: me.id_user,
    idGenerator,
  })
  me.addSteamAccount(me_steamAcount)
  friend = makeUser(FRIEND_ID, FRIEND)
  maxGuestPlanUsage = Usage.restore({
    id_usage: "max_guest_plan_usage",
    accountName: USER_STEAM_ACCOUNT,
    amountTime: 21600,
    createdAt: new Date(),
    plan_id: me.plan.id_plan,
  })
  await usersRepository.create(me)
  await usersRepository.create(friend)
})

describe("StartFarmController test suite", () => {
  test("should start the farm", async () => {
    console.log = log
    const response = await promiseHandler(
      startFarmController.handle({
        payload: {
          userId: USER_ID,
          accountName: USER_STEAM_ACCOUNT,
          gamesID: [10892],
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
          gamesID: [10892],
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
          gamesID: [10892],
        },
      })
    )

    expect(response).toStrictEqual({
      status: 400,
      json: {
        message: "Steam Account nunca foi registrada ou ela não pertence à você.",
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
      accountName: "acc1",
    })
    reachedPlan.use(allUsage)
    const user = makeUser(reachedUserID, "used_user", reachedPlan)
    user.addSteamAccount(
      SteamAccount.create({
        credentials: SteamAccountCredentials.create({
          accountName: reachedUserSteamAccountName,
          password: "REACHED_admin_pass",
        }),
        ownerId: user.id_user,
        idGenerator,
      })
    )
    await usersRepository.create(user)
    const dbUser = await usersRepository.getByID(reachedUserID)
    expect(dbUser?.steamAccounts.data).toHaveLength(1)
    expect(dbUser?.plan).toBeInstanceOf(GuestPlan)
    expect((dbUser?.plan as PlanUsage).getUsageLeft()).toBe(0)
    expect((dbUser?.plan as PlanUsage).getUsageTotal()).toBe(21600)
    const response = await promiseHandler(
      startFarmController.handle({
        payload: {
          userId: reachedUserID,
          accountName: reachedUserSteamAccountName,
          gamesID: [10892],
        },
      })
    )

    expect(response).toStrictEqual({
      status: 403,
      json: {
        message: "Seu plano não possui mais uso disponível.",
      },
    })
  })

  // IMPLEMENTAR FARM INFINITY

  // test("should run the farm if the plan is type infinity", async () => {
  //   me.assignPlan(
  //     SilverPlan.create({
  //       ownerId: me.id_user,
  //     })
  //   )
  //   await usersRepository.update(me)
  //   const response = await promiseHandler(
  //     startFarmController.handle({
  //       payload: {
  //         userId: USER_ID,
  //         accountName: USER_STEAM_ACCOUNT,
  //         gamesID: [10892],
  //       },
  //     })
  //   )

  //   expect(response).toStrictEqual({
  //     status: 200,
  //     json: { message: "Iniciando farm." },
  //   })
  // })

  test("should return message informing if no new games were added", async () => {
    const response1 = await promiseHandler(
      startFarmController.handle({
        payload: {
          userId: USER_ID,
          accountName: USER_STEAM_ACCOUNT,
          gamesID: [10892],
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
          gamesID: [10892],
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

  test("should REJECT if user attempts for farm more games than his plan allows", async () => {
    const response = await promiseHandler(
      startFarmController.handle({
        payload: {
          userId: USER_ID,
          accountName: USER_STEAM_ACCOUNT,
          gamesID: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        },
      })
    )

    expect(response).toStrictEqual({
      status: 403,
      json: {
        message: "Seu plano não permite o farm de mais do que 1 jogo por vez.",
      },
    })
  })

  test("should retrieve the credentials info from database, login and start farm", async () => {
    const response = await promiseHandler(
      startFarmController.handle({
        payload: {
          userId: USER_ID,
          accountName: USER_STEAM_ACCOUNT,
          gamesID: [10892],
        },
      })
    )

    expect(response).toStrictEqual({
      status: 200,
      json: { message: "Iniciando farm." },
    })
  })

  test("should ask for steam guard if the account has mobile steam guard", async () => {
    const startFarmController = new FarmGamesController({
      publisher,
      allUsersClientsStorage: new AllUsersClientsStorage(publisher, {
        create: () => new SteamUserMock(validSteamAccounts, true) as unknown as SteamUser,
      }),
      sacStateCacheRepository,
      usersClusterStorage,
      usersRepository,
    })

    const response = await promiseHandler(
      startFarmController.handle({
        payload: {
          userId: USER_ID,
          accountName: USER_STEAM_ACCOUNT,
          gamesID: [10892],
        },
      })
    )

    expect(response).toStrictEqual({
      status: 202,
      json: { message: "Steam Guard requerido. Enviando para seu celular." },
    })
  })

  test("should set the steam guard code across farm attempts", async () => {})

  test("should reject when account that don't exists on steam database is somehow", async () => {
    startFarmController = new FarmGamesController({
      publisher,
      sacStateCacheRepository,
      usersClusterStorage,
      usersRepository,
      allUsersClientsStorage: new AllUsersClientsStorage(publisher, {
        create: () => new SteamUserMock([]) as unknown as SteamUser,
      }),
    })

    const response = await promiseHandler(
      startFarmController.handle({
        payload: {
          userId: USER_ID,
          accountName: USER_STEAM_ACCOUNT,
          gamesID: [10892],
        },
      })
    )

    expect(response).toStrictEqual({
      status: 404,
      json: {
        message: "Steam Account não existe no banco de dados da Steam, delete essa conta e crie novamente.",
        eresult: 18,
      },
    })
  })

  test("should NOT call the farm on client when plan has no usage left", async () => {
    console.log = () => {}
    await usersRepository.dropAll()

    // SteamAccount.create({
    //   credentials: SteamAccountCredentials.create({
    //     accountName: USER_STEAM_ACCOUNT,
    //     password: "steam_account_admin_pass",
    //   }),
    //   ownerId: user.id_user,
    //   idGenerator,
    // })

    const reachedUserID = "user_ID"
    const reachedPlan = GuestPlan.create({
      ownerId: reachedUserID,
    })
    const allUsage = Usage.create({
      amountTime: 21600,
      createdAt: new Date("2023-06-10T10:00:00Z"),
      plan_id: reachedPlan.id_plan,
      accountName: USER_STEAM_ACCOUNT,
    })
    reachedPlan.use(allUsage)
    const user = makeUser(reachedUserID, "used_user", reachedPlan)
    user.addSteamAccount(me_steamAcount)
    await usersRepository.create(user)

    const response = await promiseHandler(
      startFarmController.handle({
        payload: {
          userId: user.id_user,
          accountName: USER_STEAM_ACCOUNT,
          gamesID: [10892],
        },
      })
    )

    const { userSteamClients } = allUsersClientsStorage.get(user.id_user)
    const { steamAccountClient: sac } = userSteamClients.getAccountClient(USER_STEAM_ACCOUNT)
    const spyFarmGames = jest.spyOn(sac, "farmGames")

    expect(spyFarmGames).not.toHaveBeenCalledWith([10892])

    expect(response).toStrictEqual({
      status: 403,
      json: { message: "Seu plano não possui mais uso disponível." },
    })
  })

  test("should return message saying user has run out of his plan max usage before steam guard is required", async () => {
    allUsersClientsStorage = new AllUsersClientsStorage(publisher, {
      create: () => new SteamUserMock(validSteamAccounts) as unknown as SteamUser,
    })
    startFarmController = new FarmGamesController({
      sacStateCacheRepository,
      usersClusterStorage,
      publisher,
      usersRepository,
      allUsersClientsStorage,
    })

    await usersRepository.dropAll()

    const reachedUserID = "user_ID"
    const reachedPlan = GuestPlan.create({
      ownerId: reachedUserID,
    })
    const user = makeUser(reachedUserID, "used_user", reachedPlan)
    // SteamAccount.create({
    //   credentials: SteamAccountCredentials.create({
    //     accountName: USER_STEAM_ACCOUNT,
    //     password: "steam_account_admin_pass",
    //   }),
    //   ownerId: user.id_user,
    //   idGenerator,
    // })

    const allUsage = Usage.create({
      amountTime: 21600,
      createdAt: new Date("2023-06-10T10:00:00Z"),
      plan_id: reachedPlan.id_plan,
      accountName: USER_STEAM_ACCOUNT,
    })
    reachedPlan.use(allUsage)
    user.addSteamAccount(me_steamAcount)
    await usersRepository.create(user)

    const response = await promiseHandler(
      startFarmController.handle({
        payload: {
          userId: user.id_user,
          accountName: USER_STEAM_ACCOUNT,
          gamesID: [10892],
        },
      })
    )

    const { userSteamClients } = allUsersClientsStorage.get(user.id_user)
    const { steamAccountClient: sac } = userSteamClients.getAccountClient(USER_STEAM_ACCOUNT)
    const spyFarmGames = jest.spyOn(sac, "farmGames")

    expect(spyFarmGames).not.toHaveBeenCalledWith([10892])

    expect(response).toStrictEqual({
      status: 403,
      json: { message: "Seu plano não possui mais uso disponível." },
    })
  })

  test("should ALWAYS have the latest usage left value when user attempts to farm", async () => {
    await appendUsageToUser(USER_ID, maxGuestPlanUsage)
    expect((me.plan as PlanUsage).getUsageLeft()).toBe(0)
    expect((me.plan as PlanUsage).getUsageTotal()).toBe(21600)

    await promiseHandler(
      startFarmController.handle({
        payload: {
          userId: USER_ID,
          accountName: USER_STEAM_ACCOUNT,
          gamesID: [10892],
        },
      })
    )

    const me2 = await usersRepository.getByID(USER_ID)
    if (!me2) throw new Error("User not found.")
    ;(me2?.plan as PlanUsage).removeUsage("max_guest_plan_usage")
    await usersRepository.update(me2)

    console.log = log
    const response = await promiseHandler(
      startFarmController.handle({
        payload: {
          userId: USER_ID,
          accountName: USER_STEAM_ACCOUNT,
          gamesID: [10892],
        },
      })
    )

    const me3 = (await usersRepository.getByID(USER_ID))!
    expect((me3.plan as PlanUsage).getUsageLeft()).toBe(21600)
    expect((me3.plan as PlanUsage).getUsageTotal()).toBe(0)
    expect(response.json?.message).toBe("Iniciando farm.")
  })
})

async function appendUsageToUser(userId: string, usage: Usage) {
  const user = await usersRepository.getByID(userId)
  if (!user) throw new Error("user not found")
  ;(user.plan as PlanUsage).use(usage)
  await usersRepository.update(user)
}
