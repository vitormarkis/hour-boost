import {
  CustomInstances,
  MakeTestInstancesProps,
  makeTestInstances,
  testUsers as s,
  validSteamAccounts,
} from "~/__tests__/instances"

const log = console.log
console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})
let meInstances = i.makeUserInstances("me", s.me)

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  meInstances = await i.createUser("me")
}

beforeEach(async () => {
  await setupInstances({
    validSteamAccounts,
  })
})

test("should ", async () => {})
