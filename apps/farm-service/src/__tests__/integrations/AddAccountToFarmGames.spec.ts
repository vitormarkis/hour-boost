import { AddSteamAccount, IDGeneratorUUID } from "core"
import {
  CustomInstances,
  MakeTestInstancesProps,
  makeTestInstances,
  password,
  testUsers as s,
} from "~/__tests__/instances"
import { AddSteamAccountController, FarmGamesController, promiseHandler } from "~/presentation/controllers"
import { SteamUserMockBuilder } from "~/utils/builders"
import { makeUser } from "~/utils/makeUser"

const validSteamAccounts = [
  { accountName: "paco", password },
  { accountName: "user2", password },
  { accountName: "user3", password },
]

const log = console.log
console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})
let addSteamAccountController: AddSteamAccountController
let farmGamesController: FarmGamesController

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  // meInstances = await i.createUser("me")
  const addSteamAccount = new AddSteamAccount(
    i.usersRepository,
    i.steamAccountsRepository,
    new IDGeneratorUUID()
  )
  const me = makeUser(s.me.userId, s.me.username)
  await i.usersRepository.create(me)
  addSteamAccountController = new AddSteamAccountController(
    addSteamAccount,
    i.allUsersClientsStorage,
    i.usersDAO
  )

  farmGamesController = new FarmGamesController({
    allUsersClientsStorage: i.allUsersClientsStorage,
    planRepository: i.planRepository,
    publisher: i.publisher,
    sacStateCacheRepository: i.sacStateCacheRepository,
    usersClusterStorage: i.usersClusterStorage,
    usersRepository: i.usersRepository,
    farmGamesUseCase: i.farmGamesUseCase,
  })
}

beforeEach(async () => {
  await setupInstances({
    validSteamAccounts,
  })
})

describe("should register a new steam account in the storage after addition of a new steam account", () => {
  test("should create user1", async () => {
    const userx1 = await i.usersRepository.getByID(s.me.userId)
    expect(userx1?.steamAccounts.data).toHaveLength(0)
    const { status, json } = await promiseHandler(
      addSteamAccountController.handle({
        payload: {
          accountName: s.me.accountName,
          password: "pass",
          userId: s.me.userId,
        },
      })
    )
    const userx2 = await i.usersRepository.getByID(s.me.userId)
    expect(userx2?.steamAccounts.data).toHaveLength(1)

    expect(json?.message).toBe("paco adicionada com sucesso!")
    expect(status).toBe(201)

    /**
     * test2
     */

    const userx3 = await i.usersRepository.getByID(s.me.userId)
    expect(userx3?.steamAccounts.data).toHaveLength(1)

    await i.usersRepository.getByID(s.me.userId)
    const { status: status2, json: json2 } = await promiseHandler(
      farmGamesController.handle({
        payload: {
          accountName: s.me.accountName,
          gamesID: [1029],
          userId: s.me.userId,
        },
      })
    )
    expect(json2?.message).toBe("Iniciando farm.")
    expect(status2).toBe(200)
  })

  describe("mobile", () => {
    beforeEach(async () => {
      await setupInstances(
        { validSteamAccounts },
        { steamUserBuilder: new SteamUserMockBuilder(validSteamAccounts, true) }
      )
    })

    test("should ask for steam guard code, set and then remove it from last handler", async () => {
      const getUserSAC = () =>
        i.allUsersClientsStorage.getOrThrow(s.me.userId).getAccountClientOrThrow(s.me.accountName)
      expect(() => getUserSAC()).toThrowError("Esse usuário não possui contas da Steam ativas na plataforma.")
      // expect to not have a client instance of this account before it is added

      const response = await promiseHandler(
        addSteamAccountController.handle({
          payload: {
            accountName: s.me.accountName,
            password: "user1_PASS",
            userId: s.me.userId,
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
})
