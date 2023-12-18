import { GuestPlan, PlanUsage, Usage } from "core"
import {
  CustomInstances,
  MakeTestInstancesProps,
  makeTestInstances,
  makeUserInstances,
  password,
  testUsers as s,
  validSteamAccounts,
} from "~/__tests__/instances"
import { PlanBuilder } from "~/application/factories/PlanFactory"
import { StopFarmController, promiseHandler } from "~/presentation/controllers"
import { FarmGamesController } from "~/presentation/controllers/FarmGamesController"
import { SteamUserMockBuilder } from "~/utils/builders"
import { makeUser } from "~/utils/makeUser"

const now = new Date("2023-06-10T10:00:00Z")
const log = console.log
console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})
let meInstances = makeUserInstances("me", s.me, i.sacFactory)
let farmGamesController: FarmGamesController
let stopFarmController: StopFarmController

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  meInstances = await i.createUser("me")
  farmGamesController = new FarmGamesController({
    allUsersClientsStorage: i.allUsersClientsStorage,
    planRepository: i.planRepository,
    publisher: i.publisher,
    sacStateCacheRepository: i.sacStateCacheRepository,
    usersClusterStorage: i.usersClusterStorage,
    usersRepository: i.usersRepository,
  })
  stopFarmController = new StopFarmController(i.usersClusterStorage, i.usersRepository)
}

describe("mobile", () => {
  beforeEach(async () => {
    await setupInstances(
      {
        validSteamAccounts,
      },
      {
        steamUserBuilder: new SteamUserMockBuilder(validSteamAccounts, true),
      }
    )
  })

  test("should ask for steam guard if the account has mobile steam guard", async () => {
    const response = await promiseHandler(
      farmGamesController.handle({
        payload: {
          userId: s.me.userId,
          accountName: s.me.accountName,
          gamesID: [10892],
        },
      })
    )

    expect(response).toStrictEqual({
      status: 202,
      json: { message: "Steam Guard requerido. Enviando para seu celular." },
    })
  })
})

describe("not mobile", () => {
  beforeEach(async () => {
    await setupInstances({
      validSteamAccounts,
    })
  })

  test("should start the farm", async () => {
    const response = await promiseHandler(
      farmGamesController.handle({
        payload: {
          userId: s.me.userId,
          accountName: s.me.accountName,
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
      farmGamesController.handle({
        payload: {
          userId: "RANDOM_ID_SDFIWI",
          accountName: s.me.accountName,
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
      farmGamesController.handle({
        payload: {
          userId: s.me.userId,
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
    const reachedPlan = GuestPlan.create({
      ownerId: s.me.userId,
    })
    const allUsage = Usage.create({
      amountTime: 21600,
      createdAt: new Date("2023-06-10T10:00:00Z"),
      plan_id: reachedPlan.id_plan,
      accountName: s.me.accountName,
    })
    reachedPlan.use(allUsage)
    const me = await i.usersRepository.getByID(s.me.userId)
    if (!me || !(me.plan instanceof PlanUsage)) throw new Error()
    me.plan.use(allUsage)
    await i.usersRepository.update(me)
    const dbUser = await i.usersRepository.getByID(s.me.userId)
    expect(dbUser?.steamAccounts.data).toHaveLength(1)
    expect(dbUser?.plan).toBeInstanceOf(GuestPlan)
    expect((dbUser?.plan as PlanUsage).getUsageLeft()).toBe(0)
    expect((dbUser?.plan as PlanUsage).getUsageTotal()).toBe(21600)
    const response = await promiseHandler(
      farmGamesController.handle({
        payload: {
          userId: s.me.userId,
          accountName: s.me.accountName,
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
  //   await i.usersRepository.update(me)
  //   const response = await promiseHandler(
  //     startFarmController.handle({
  //       payload: {
  //         userId: s.me.userId,
  //         accountName: s.me.accountName,
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
      farmGamesController.handle({
        payload: {
          userId: s.me.userId,
          accountName: s.me.accountName,
          gamesID: [10892],
        },
      })
    )

    expect(response1).toStrictEqual({
      status: 200,
      json: { message: "Iniciando farm." },
    })

    const response = await promiseHandler(
      farmGamesController.handle({
        payload: {
          userId: s.me.userId,
          accountName: s.me.accountName,
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
      farmGamesController.handle({
        payload: {
          userId: s.me.userId,
          accountName: s.me.accountName,
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
      farmGamesController.handle({
        payload: {
          userId: s.me.userId,
          accountName: s.me.accountName,
          gamesID: [10892],
        },
      })
    )

    expect(response).toStrictEqual({
      status: 200,
      json: { message: "Iniciando farm." },
    })
  })

  test("should NOT call the farm on client when plan has no usage left", async () => {
    // SteamAccount.create({
    //   credentials: SteamAccountCredentials.create({
    //     accountName: s.me.accountName,
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
      accountName: s.me.accountName,
    })
    reachedPlan.use(allUsage)
    const user = makeUser(reachedUserID, "used_user", reachedPlan)
    user.addSteamAccount(meInstances.meSteamAccount)
    await i.usersRepository.create(user)

    const response = await promiseHandler(
      farmGamesController.handle({
        payload: {
          userId: user.id_user,
          accountName: s.me.accountName,
          gamesID: [10892],
        },
      })
    )

    const userClients = i.allUsersClientsStorage.getOrThrow(user.id_user)
    const sac = userClients.getAccountClientOrThrow(s.me.accountName)
    const spyFarmGames = jest.spyOn(sac, "farmGames")

    expect(spyFarmGames).not.toHaveBeenCalledWith([10892])

    expect(response).toStrictEqual({
      status: 403,
      json: { message: "Seu plano não possui mais uso disponível." },
    })
  })

  test("should return message saying user has run out of his plan max usage before steam guard is required", async () => {
    const reachedUserID = "user_ID"
    const reachedPlan = GuestPlan.create({
      ownerId: reachedUserID,
    })
    const user = makeUser(reachedUserID, "used_user", reachedPlan)
    // SteamAccount.create({
    //   credentials: SteamAccountCredentials.create({
    //     accountName: s.me.accountName,
    //     password: "steam_account_admin_pass",
    //   }),
    //   ownerId: user.id_user,
    //   idGenerator,
    // })

    const allUsage = Usage.create({
      amountTime: 21600,
      createdAt: new Date("2023-06-10T10:00:00Z"),
      plan_id: reachedPlan.id_plan,
      accountName: s.me.accountName,
    })
    reachedPlan.use(allUsage)
    user.addSteamAccount(meInstances.meSteamAccount)
    await i.usersRepository.create(user)

    const response = await promiseHandler(
      farmGamesController.handle({
        payload: {
          userId: user.id_user,
          accountName: s.me.accountName,
          gamesID: [10892],
        },
      })
    )

    const userClients = i.allUsersClientsStorage.getOrThrow(user.id_user)
    const sac = userClients.getAccountClientOrThrow(s.me.accountName)
    const spyFarmGames = jest.spyOn(sac, "farmGames")

    expect(spyFarmGames).not.toHaveBeenCalledWith([10892])

    expect(response).toStrictEqual({
      status: 403,
      json: { message: "Seu plano não possui mais uso disponível." },
    })
  })

  test("should ALWAYS have the latest usage left value when user attempts to farm", async () => {
    const maxGuestPlanUsage = Usage.restore({
      id_usage: "max_guest_plan_usage",
      accountName: s.me.accountName,
      amountTime: 21600,
      createdAt: now,
      plan_id: meInstances.me.plan.id_plan,
    })
    await i.usePlan(s.me.userId, maxGuestPlanUsage)
    expect((meInstances.me.plan as PlanUsage).getUsageLeft()).toBe(0)
    expect((meInstances.me.plan as PlanUsage).getUsageTotal()).toBe(21600)

    await promiseHandler(
      farmGamesController.handle({
        payload: {
          userId: s.me.userId,
          accountName: s.me.accountName,
          gamesID: [10892],
        },
      })
    )

    const me2 = await i.usersRepository.getByID(s.me.userId)
    if (!me2) throw new Error("User not found.")
    ;(me2.plan as PlanUsage).removeUsage("max_guest_plan_usage")
    await i.usersRepository.update(me2)

    const response = await promiseHandler(
      farmGamesController.handle({
        payload: {
          userId: s.me.userId,
          accountName: s.me.accountName,
          gamesID: [10892],
        },
      })
    )

    const me3 = (await i.usersRepository.getByID(s.me.userId))!
    expect((me3.plan as PlanUsage).getUsageLeft()).toBe(21600)
    expect((me3.plan as PlanUsage).getUsageTotal()).toBe(0)
    expect(response.json?.message).toBe("Iniciando farm.")
  })

  test("should NOT ADD new SAC if the account already exists on storage and is not farming", async () => {
    const responseFarm1 = await promiseHandler(
      farmGamesController.handle({
        payload: {
          userId: s.me.userId,
          accountName: s.me.accountName,
          gamesID: [10892],
        },
      })
    )
    expect(responseFarm1.status).toBe(200)

    const userCluster = i.usersClusterStorage.getOrThrow(s.me.username)
    const addSacSPY = jest.spyOn(userCluster, "addSAC")
    expect(addSacSPY).toBeTruthy()

    const responseStopFarm1 = await promiseHandler(
      stopFarmController.handle({
        payload: {
          userId: s.me.userId,
          accountName: s.me.accountName,
        },
      })
    )
    expect(responseStopFarm1.status).toBe(200)

    const responseFarm2 = await promiseHandler(
      farmGamesController.handle({
        payload: {
          userId: s.me.userId,
          accountName: s.me.accountName,
          gamesID: [10892],
        },
      })
    )

    console.log({
      calls: addSacSPY.mock.calls,
    })
    expect(responseFarm2.status).toBe(200)
  })
})

describe("no users on steam database", () => {
  beforeEach(async () => {
    await setupInstances({
      validSteamAccounts: [],
    })
  })

  test("should reject when account that don't exists on steam database is somehow", async () => {
    const response = await promiseHandler(
      farmGamesController.handle({
        payload: {
          userId: s.me.userId,
          accountName: s.me.accountName,
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
})