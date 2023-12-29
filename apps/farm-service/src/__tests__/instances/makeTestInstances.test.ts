import { SteamAccountCredentials } from "core"
import { makeTestInstances } from "~/__tests__/instances"
import { SteamUserMockBuilder } from "~/utils/builders"

const validSteamAccounts: SteamAccountCredentials[] = [{ accountName: "accountname", password: "pass" }]

beforeEach(() => {
  jest.useFakeTimers({ doNotFake: ["setImmediate"] })
})

afterAll(() => {
  jest.useRealTimers()
})

test("should create NOT mobile steam user mock ", async () => {
  const i = makeTestInstances({
    validSteamAccounts,
  })
  const sac = i.allUsersClientsStorage.getOrAddSteamAccount({
    accountName: "accountname",
    userId: "userid",
    username: "username",
    planId: "",
  })
  const sacClientEmitterSPY = jest.spyOn(sac.client, "emit")
  sac.login("accountname", "pass")
  jest.advanceTimersByTime(1)
  expect(sacClientEmitterSPY.mock.calls[0][0]).toBe("loggedOn")
})

test("should create MOBILE steam user mock ", async () => {
  const i = makeTestInstances(
    {
      validSteamAccounts,
    },
    {
      steamUserBuilder: new SteamUserMockBuilder(validSteamAccounts, true),
    }
  )
  const sac = i.allUsersClientsStorage.getOrAddSteamAccount({
    accountName: "accountname",
    userId: "userid",
    username: "username",
    planId: "",
  })
  const sacClientEmitterSPY = jest.spyOn(sac.client, "emit")
  sac.login("accountname", "pass")
  jest.advanceTimersByTime(1)
  console.log(sacClientEmitterSPY.mock.calls)
  expect(sacClientEmitterSPY.mock.calls[0][0]).toBe("steamGuard")
})
