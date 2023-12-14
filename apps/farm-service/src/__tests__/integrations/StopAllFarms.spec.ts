import {
  CustomInstances,
  MakeTestInstancesProps,
  makeTestInstances,
  makeUserInstances,
  password,
  testUsers as s,
} from "~/__tests__/instances"
import { PlanBuilder } from "~/application/factories/PlanFactory"

import { FarmGamesController } from "~/presentation/controllers"

const validSteamAccounts = [
  { accountName: "paco", password },
  { accountName: "fred", password },
  { accountName: "bane", password },
]

const log = console.log
console.log = () => {}

let i = makeTestInstances({ validSteamAccounts })
let meInstances = makeUserInstances("me", s.me, i.sacFactory)
let friendInstances = makeUserInstances("friend", s.friend, i.sacFactory)
let farmGamesController: FarmGamesController

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  meInstances = await i.createUser("me")
  friendInstances = await i.createUser("friend")
  const diamondPlan = new PlanBuilder(s.me.userId).infinity().diamond()
  await i.changeUserPlan(diamondPlan)
  await i.addSteamAccount(s.me.userId, s.me.accountName2, password)
  farmGamesController = new FarmGamesController({
    allUsersClientsStorage: i.allUsersClientsStorage,
    planRepository: i.planRepository,
    publisher: i.publisher,
    sacStateCacheRepository: i.sacStateCacheRepository,
    usersClusterStorage: i.usersClusterStorage,
    usersRepository: i.usersRepository,
  })
}

beforeEach(async () => {
  await setupInstances({ validSteamAccounts })
})
test.only("should stop all farms", async () => {
  console.log = log
  await farmGamesController.handle({
    payload: { accountName: s.me.accountName, gamesID: [109230], userId: s.me.userId },
  })
  await farmGamesController.handle({
    payload: { accountName: s.me.accountName2, gamesID: [109230], userId: s.me.userId },
  })
  await farmGamesController.handle({
    payload: { accountName: s.friend.accountName, gamesID: [109230], userId: s.friend.userId },
  })
  expect(i.allUsersClientsStorage.listUsers()).toStrictEqual({
    [s.me.userId]: {
      [s.me.accountName]: {
        farming: true,
      },
      [s.me.accountName2]: {
        farming: true,
      },
    },
    [s.friend.userId]: {
      [s.friend.accountName]: {
        farming: true,
      },
    },
  })
})
