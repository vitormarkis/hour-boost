import {
  makeTestInstances,
  validSteamAccounts,
  PrefixKeys,
  MakeTestInstancesProps,
  CustomInstances,
} from "~/__tests__/instances"
import { testUsers as s } from "~/infra/services/UserAuthenticationInMemory"

const log = console.log
console.log = () => {}

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
})

test("should restore", async () => {
  expect(true).toBe(true)
})
