import {
  CustomInstances,
  MakeTestInstancesProps,
  PrefixKeys,
  makeTestInstances,
  validSteamAccounts,
} from "~/__tests__/instances"
import { testUsers as s } from "~/infra/services/UserAuthenticationInMemory"

const log = console.log
// console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})
let meInstances = {} as PrefixKeys<"me">

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  meInstances = await i.createUser("me")
}

beforeEach(async () => {
  await setupInstances({
    validSteamAccounts,
  })
  await i.sacStateCacheRepository.flushAll()
})

test("should write a ME cache and retrieves it", async () => {
  // console.log = log
  await expect(
    i.sacStateCacheRepository.set("markis", {
      accountName: "markis",
      gamesPlaying: [],
      isFarming: false,
      planId: meInstances.me.plan.id_plan,
      username: s.me.username,
    })
  ).resolves.not.toThrow()
  const cache = await i.sacStateCacheRepository.get("markis")
  console.log({ cache })
  expect(cache).toStrictEqual({
    accountName: "markis",
    gamesPlaying: [],
    isFarming: false,
  })
})

test("should init state cache", async () => {
  await i.sacStateCacheRepository.flushAll()
  await i.sacStateCacheRepository.init({
    accountName: s.me.accountName,
    planId: meInstances.me.plan.id_plan,
    username: s.me.username,
  })
  const state = await i.sacStateCacheRepository.get(s.me.accountName)
  expect(state?.accountName).toBe(s.me.accountName)
  expect(state?.gamesPlaying).toStrictEqual([])
  expect(state?.isFarming).toBeFalsy()
})

test("should init in case object weren't created", async () => {
  await i.sacStateCacheRepository.flushAll()
  await i.sacStateCacheRepository.setPlayingGames(s.me.accountName, [1009])
  const state = await i.sacStateCacheRepository.get(s.me.accountName)
  expect(state?.accountName).toBe(s.me.accountName)
  expect(state?.gamesPlaying).toStrictEqual([1009])
  expect(state?.isFarming).toBeTruthy()
})
