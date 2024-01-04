import { AddSteamAccount } from "core"
import {
  CustomInstances,
  MakeTestInstancesProps,
  makeTestInstances,
  password,
  testUsers as s,
  validSteamAccounts,
} from "~/__tests__/instances"
import { PlanBuilder } from "~/application/factories/PlanFactory"
import { AddSteamAccountController } from "~/presentation/controllers/"
import { promiseHandler } from "~/presentation/controllers/promiseHandler"
import { SteamUserMockBuilder } from "~/utils/builders"

const log = console.log
console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})
let sut: AddSteamAccountController
let meInstances = i.makeUserInstances("me", s.me)
let friendInstances = i.makeUserInstances("friend", s.friend)

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  meInstances = await i.createUser("me")
  friendInstances = await i.createUser("friend")
  const addSteamAccount = new AddSteamAccount(i.usersRepository, i.steamAccountsRepository, i.idGenerator)

  sut = new AddSteamAccountController(
    addSteamAccount,
    i.allUsersClientsStorage,
    i.usersDAO,
    i.checkSteamAccountOwnerStatusUseCase
  )
  i.usersMemory.dropAllSteamAccounts()
}

beforeEach(async () => {
  await setupInstances({
    validSteamAccounts,
  })
})

describe("AddSteamAccountController test suite", () => {
  describe("not mobile", () => {
    test("should add new account in case it exists on steam database", async () => {
      const dbMe = await i.usersRepository.getByID(s.me.userId)
      expect(dbMe?.steamAccounts.data).toHaveLength(0)
      const { status, json } = await promiseHandler(
        sut.handle({
          payload: {
            accountName: s.me.accountName,
            password,
            userId: s.me.userId,
          },
        })
      )
      const dbMe2 = await i.usersRepository.getByID(s.me.userId)
      expect(dbMe2?.steamAccounts.data).toHaveLength(1)
      expect(typeof json.steamAccountID).toBe("string")
      expect(json).toStrictEqual(
        expect.objectContaining({
          message: `${s.me.accountName} adicionada com sucesso!`,
        })
      )
      expect(status).toBe(201)
    })

    test("should reject if provided account don't exist on steam database", async () => {
      const dbMe = await i.usersRepository.getByID(s.me.userId)
      expect(dbMe!.steamAccounts.data).toHaveLength(0)
      const { status, json } = await promiseHandler(
        sut.handle({
          payload: {
            accountName: "random_user",
            password: "xx",
            userId: s.me.userId,
          },
        })
      )
      const dbMe2 = await i.usersRepository.getByID(s.me.userId)
      expect(dbMe2!.steamAccounts.data).toHaveLength(0)
      expect(json).toStrictEqual(
        expect.objectContaining({
          message: "Steam Account não existe no banco de dados da Steam, delete essa conta e crie novamente.",
        })
      )
      expect(status).toBe(404)
    })

    describe("plan diamond test suite", () => {
      beforeEach(async () => {
        const diamondPlan = new PlanBuilder(s.me.userId).infinity().diamond()
        await i.changeUserPlan(diamondPlan)
      })

      test("should reject when user attempts to add more accounts than his plan allows", async () => {
        await sut.handle({
          payload: { accountName: s.me.accountName, password, userId: s.me.userId },
        })
        await sut.handle({
          payload: { accountName: s.me.accountName2, password, userId: s.me.userId },
        })
        const dbMe = await i.usersRepository.getByID(s.me.userId)
        expect(dbMe?.steamAccounts.data).toHaveLength(2)
        const { status, json } = await sut.handle({
          payload: {
            accountName: s.me.accountName3,
            password,
            userId: s.me.userId,
          },
        })
        const dbMe2 = await i.usersRepository.getByID(s.me.userId)
        expect(dbMe2?.steamAccounts.data).toHaveLength(2)
        expect(json).toStrictEqual({
          message: "Você já adicionou o máximo de contas que seu plano permite!",
        })
        expect(status).toBe(400)
      })

      test("should reject when user attempts to add an account he already has", async () => {
        await sut.handle({
          payload: { accountName: s.me.accountName, password, userId: s.me.userId },
        })
        const dbMe = await i.usersRepository.getByID(s.me.userId)
        expect(dbMe?.steamAccounts.data).toHaveLength(1)
        expect(dbMe?.plan.maxSteamAccounts).toBe(2)
        const { status, json } = await sut.handle({
          payload: {
            accountName: s.me.accountName,
            password,
            userId: s.me.userId,
          },
        })
        const dbMe2 = await i.usersRepository.getByID(s.me.userId)
        expect(dbMe2?.steamAccounts.data).toHaveLength(1)
        expect(json).toStrictEqual({
          message: "Você já possui essa conta cadastrada.",
        })
        expect(status).toBe(400)
      })
    })

    test("should reject when user attempts to add an account that is already owned by other user", async () => {
      await promiseHandler(
        sut.handle({
          payload: {
            accountName: s.me.accountName,
            password,
            userId: s.me.userId,
          },
        })
      )
      const { status, json } = await promiseHandler(
        sut.handle({
          payload: {
            accountName: s.me.accountName,
            password,
            userId: s.friend.userId,
          },
        })
      )

      expect(json).toStrictEqual({
        message: "Essa conta da Steam já foi registrada por outro usuário.",
      })
      expect(status).toBe(403)
    })

    test.skip("should ask for steam guard if asked", async () => {
      throw new Error("Not implemented")
    })

    test.skip("should timeout", async () => {
      throw new Error("Not implemented")
    })
  })

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

    test("should asks user for the steam guard", async () => {
      const { status, json } = await promiseHandler(
        sut.handle({
          payload: { accountName: s.me.accountName, password, userId: s.me.userId },
        })
      )

      expect(json).toStrictEqual({
        message: "Steam Guard requerido. Enviando para seu celular.",
      })
      expect(status).toBe(202)
    })
  })
})
