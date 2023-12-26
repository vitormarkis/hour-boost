import { AccountSteamGamesList } from "core"
import { RefreshGamesUseCase } from "~/presentation/presenters/RefreshGamesUseCase"

import {
  CustomInstances,
  MakeTestInstancesProps,
  makeTestInstances,
  makeUserInstances,
  testUsers as s,
  validSteamAccounts,
} from "~/__tests__/instances"
import { FarmGamesController } from "~/presentation/controllers"

const log = console.log
console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})
let meInstances = makeUserInstances("me", s.me, i.sacFactory)
let refreshGamesUseCase: RefreshGamesUseCase
let farmGamesController: FarmGamesController

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  meInstances = await i.createUser("me")
  refreshGamesUseCase = new RefreshGamesUseCase(i.sacStateCacheRepository, i.allUsersClientsStorage)
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
  await setupInstances({
    validSteamAccounts,
  })
})

test("should refresh account games", async () => {
  await farmGamesController.handle({
    payload: { accountName: s.me.accountName, gamesID: [730], userId: s.me.userId },
  })
  console.log = log
  const gameList = await i.sacStateCacheRepository.getAccountGames(s.me.accountName)
  expect(gameList).toStrictEqual(null)
  await refreshGamesUseCase.execute({
    accountName: s.me.accountName,
    userId: s.me.userId,
  })
  const gameList2 = await i.sacStateCacheRepository.getAccountGames(s.me.accountName)
  expect(gameList2).toBeInstanceOf(AccountSteamGamesList)
  expect(gameList2?.games).toHaveLength(2)
})
