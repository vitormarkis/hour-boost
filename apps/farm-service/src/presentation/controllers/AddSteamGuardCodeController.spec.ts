import { AddSteamAccount, IDGeneratorUUID } from "core"
import { promiseHandler } from "~/presentation/controllers/promiseHandler"
import { makeUser } from "~/utils/makeUser"

import {
  CustomInstances,
  MakeTestInstancesProps,
  makeTestInstances,
  password,
  testUsers as s,
} from "~/__tests__/instances"
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
let addSteamAccount: AddSteamAccount
let addSteamGuardCodeController: AddSteamGuardCodeController
let addSteamAccountController: AddSteamAccountController

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  addSteamAccount = new AddSteamAccount(i.usersRepository, i.steamAccountsRepository, new IDGeneratorUUID())
  addSteamGuardCodeController = new AddSteamGuardCodeController(i.allUsersClientsStorage)
  addSteamAccountController = new AddSteamAccountController(
    addSteamAccount,
    i.allUsersClientsStorage,
    i.usersDAO,
    i.checkSteamAccountOwnerStatusUseCase
  )
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
    beforeEach(async () => {})

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
