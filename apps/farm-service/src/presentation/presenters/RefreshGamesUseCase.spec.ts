import { AccountSteamGamesList } from "core"
import { RefreshGamesUseCase } from "~/presentation/presenters/RefreshGamesUseCase"

import {
  type 
  CustomInstances,
  type 
  MakeTestInstancesProps,
  type 
  PrefixKeys,
  makeTestInstances,
  validSteamAccounts,
} from "~/__tests__/instances"
import { testUsers as s } from "~/infra/services/UserAuthenticationInMemory"
import { FarmGamesController } from "~/presentation/controllers"

const log = console.log
console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})
let meInstances = {} as PrefixKeys<"me">
let refreshGamesUseCase: RefreshGamesUseCase
let farmGamesController: FarmGamesController

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  meInstances = await i.createUser("me")
  refreshGamesUseCase = new RefreshGamesUseCase(i.sacStateCacheRepository, i.allUsersClientsStorage)
  farmGamesController = new FarmGamesController({
    allUsersClientsStorage: i.allUsersClientsStorage,
    usersRepository: i.usersRepository,
    farmGamesUseCase: i.farmGamesUseCase,
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
