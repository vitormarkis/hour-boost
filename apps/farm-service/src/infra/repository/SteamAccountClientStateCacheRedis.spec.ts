import {
  CustomInstances,
  MakeTestInstancesProps,
  makeTestInstances,
  makeUserInstances,
  testUsers as s,
  validSteamAccounts,
} from "~/__tests__/instances"

const log = console.log
console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})
let meInstances = makeUserInstances("me", s.me, i.sacFactory)

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  meInstances = await i.createUser("me")
}

beforeEach(async () => {
  await setupInstances({
    validSteamAccounts,
  })
})

test("should write a ME cache and retrieves it", async () => {
  await expect(
    i.sacStateCacheRepository.set("vitor:markis", {
      accountName: "markis",
      gamesPlaying: [],
      isFarming: false,
    })
  ).resolves.not.toThrow()
  const cache = await i.sacStateCacheRepository.get("vitor:markis")
  expect(cache).toStrictEqual({
    accountName: "markis",
    gamesPlaying: [],
    isFarming: false,
  })
})
