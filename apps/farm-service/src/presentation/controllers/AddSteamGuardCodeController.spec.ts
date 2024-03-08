import { jest } from "@jest/globals"
import { AddSteamAccount } from "core"
import { promiseHandler } from "~/presentation/controllers/promiseHandler"
import { makeUser } from "~/utils/makeUser"

import { type CustomInstances, type MakeTestInstancesProps, makeTestInstances, password } from "~/__tests__/instances"
import { AddSteamAccountUseCase } from "~/application/use-cases/AddSteamAccountUseCase"
import { testUsers as s } from "~/infra/services/UserAuthenticationInMemory"
import { AddSteamAccountController, AddSteamGuardCodeController } from "~/presentation/controllers"

const log = console.log
console.log = () => {}

const validSteamAccounts = [
  { accountName: "paco", password },
  { accountName: "user2", password },
  { accountName: "user3", password },
]

let i = makeTestInstances({
  validSteamAccounts,
})
let addSteamGuardCodeController: AddSteamGuardCodeController
let addSteamAccountController: AddSteamAccountController

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  const addSteamAccount = new AddSteamAccount(i.usersRepository, i.steamAccountsRepository, i.idGenerator)
  const addSteamAccountUseCase = new AddSteamAccountUseCase(
    addSteamAccount,
    i.allUsersClientsStorage,
    i.usersDAO,
    i.checkSteamAccountOwnerStatusUseCase
  )

  addSteamAccountController = new AddSteamAccountController(addSteamAccountUseCase)
  addSteamGuardCodeController = new AddSteamGuardCodeController(i.allUsersClientsStorage)
}

describe("AddSteamGuardCodeController test suite", () => {
  describe("user has NOT attempted to log yet", () => {
    beforeEach(async () => {
      await setupInstances({
        validSteamAccounts,
      })
    })
    test("should reject when providing code for a sac that never tried to log", async () => {
      const { status, json } = await promiseHandler(
        addSteamGuardCodeController.handle({
          payload: {
            accountName: s.me.accountName,
            code: "998776",
            userId: s.me.userId,
          },
        })
      )

      expect(json).toStrictEqual({
        message: "Falha ao adicionar código Steam Guard. Usuário nunca tentou fazer login com essa conta.",
      })
      expect(status).toBe(400)
    })
  })
  describe("user has attempted to log", () => {
    beforeEach(async () => {
      await setupInstances({
        validSteamAccounts,
      })
    })

    test("should set the steam guard code and log in", async () => {
      await setupInstances({
        validSteamAccounts,
      })
      const me = makeUser(s.me.userId, s.me.username)
      await i.usersRepository.create(me)
      addSteamAccountController.handle({
        payload: {
          password: "pass",
          userId: s.me.userId,
          accountName: s.me.accountName,
        },
      })
      await new Promise(process.nextTick)
      const sac = i.allUsersClientsStorage.getAccountClientOrThrow(s.me.userId, s.me.accountName)
      const sacClientEmitterSPY = jest.spyOn(sac.client, "emit")

      const { status } = await promiseHandler(
        addSteamGuardCodeController.handle({
          payload: {
            accountName: s.me.accountName,
            code: "998776",
            userId: s.me.userId,
          },
        })
      )
      expect(status).toBe(200)
      expect(sacClientEmitterSPY.mock.calls[0][0]).toStrictEqual("loggedOn")
    })

    test.skip("should rejects an error is thrown", async () => {
      throw new Error("Not implemented")
    })
  })
})
