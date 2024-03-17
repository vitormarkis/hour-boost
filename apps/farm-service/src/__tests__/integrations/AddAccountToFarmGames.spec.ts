import { AddSteamAccount } from "core"
import {
  type CustomInstances,
  type MakeTestInstancesProps,
  makeTestInstances,
  password,
} from "~/__tests__/instances"
import { AddSteamAccountUseCase } from "~/application/use-cases/AddSteamAccountUseCase"
import { testUsers as s } from "~/infra/services/UserAuthenticationInMemory"
import { AddSteamAccountController, promiseHandler } from "~/presentation/controllers"
import { SteamUserMockBuilder } from "~/utils/builders"

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
async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  // meInstances = await i.createUser("me")
  await i.createUser("me", {
    persistSteamAccounts: false,
  })
  const addSteamAccount = new AddSteamAccount(i.usersRepository, i.steamAccountsRepository, i.idGenerator)
  const addSteamAccountUseCase = new AddSteamAccountUseCase(
    addSteamAccount,
    i.allUsersClientsStorage,
    i.usersDAO,
    i.checkSteamAccountOwnerStatusUseCase,
    i.hashService
  )

  addSteamAccountController = new AddSteamAccountController(addSteamAccountUseCase)

  i.steamAccountsMemory.disownSteamAccountsAll()
  i.usersMemory.dropAllSteamAccounts()
}

beforeEach(async () => {
  await setupInstances({
    validSteamAccounts,
  })
})

console.log = log
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
      i.farmGamesController.handle({
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

      await promiseHandler(
        addSteamAccountController.handle({
          payload: {
            accountName: s.me.accountName,
            password,
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
