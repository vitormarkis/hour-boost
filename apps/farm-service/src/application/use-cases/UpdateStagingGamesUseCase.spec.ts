import {
  makeTestInstances,
  validSteamAccounts,
  MakeTestInstancesProps,
  CustomInstances,
  password,
} from "~/__tests__/instances"
import { AutoRestartCron } from "~/application/cron/AutoRestartCron"
import {
  CreateUserUseCase,
  RestoreAccountConnectionUseCase,
  RestoreAccountSessionUseCase,
  UpdateStagingGamesUseCase,
} from "~/application/use-cases"
import { StagingGamesListService } from "~/domain/services"

import { testUsers as s } from "~/infra/services/UserAuthenticationInMemory"

const log = console.log
console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  const createUser = new CreateUserUseCase(i.usersRepository, i.userAuthentication, i.usersClusterStorage)
  await createUser.execute(s.me.userId)
  await i.addSteamAccount(s.me.userId, s.me.accountName, password)
  const restoreAccountConnectionUseCase = new RestoreAccountConnectionUseCase(
    i.allUsersClientsStorage,
    i.usersClusterStorage,
    i.sacStateCacheRepository
  )
  const restoreAccountSessionUseCase = new RestoreAccountSessionUseCase(
    i.usersClusterStorage,
    i.sacStateCacheRepository
  )
  const autoRestartCron = new AutoRestartCron(
    i.allUsersClientsStorage,
    i.planRepository,
    i.steamAccountsRepository,
    restoreAccountConnectionUseCase,
    restoreAccountSessionUseCase,
    i.usersDAO
  )

  await autoRestartCron.run({
    accountName: s.me.accountName,
  })
}

beforeEach(async () => {
  await setupInstances({
    validSteamAccounts,
  })
})

describe("UpdateStagingGamesUseCase test suite", () => {
  test("should update the staging games", async () => {
    const stagingGamesListService = new StagingGamesListService()
    const updateStagingGamesUseCase = new UpdateStagingGamesUseCase(
      stagingGamesListService,
      i.usersClusterStorage,
      i.usersRepository,
      i.sacStateCacheRepository
    )

    const SACStateCache = await i.sacStateCacheRepository.get(s.me.accountName)
    expect(SACStateCache?.gamesStaging).toStrictEqual([])

    const [error, result] = await updateStagingGamesUseCase.execute({
      accountName: s.me.accountName,
      newGameList: [722],
      userId: s.me.userId,
    })

    expect(error).toBeNull()
    expect(result?.gamesStaging).toStrictEqual([722])

    /**
     * Persist
     */
    const SACStateCache_2 = await i.sacStateCacheRepository.get(s.me.accountName)
    expect(SACStateCache_2?.gamesStaging).toStrictEqual([722])

    /**
     * Clean staging games
     */
    const [error_2, result_2] = await updateStagingGamesUseCase.execute({
      accountName: s.me.accountName,
      newGameList: [],
      userId: s.me.userId,
    })
    expect(error_2).toBeNull()
    expect(result_2?.gamesStaging).toStrictEqual([])
    const SACStateCache_3 = await i.sacStateCacheRepository.get(s.me.accountName)
    expect(SACStateCache_3?.gamesStaging).toStrictEqual([])
  })

  test("should error if user stage more game than his plan allows", async () => {
    const stagingGamesListService = new StagingGamesListService()
    const updateStagingGamesUseCase = new UpdateStagingGamesUseCase(
      stagingGamesListService,
      i.usersClusterStorage,
      i.usersRepository,
      i.sacStateCacheRepository
    )

    const [error, result] = await updateStagingGamesUseCase.execute({
      accountName: s.me.accountName,
      newGameList: [722, 511],
      userId: s.me.userId,
    })

    expect(error?.code).toBe("STAGE-MORE-GAMES-THAN-PLAN-ALLOWS")
    expect(result).toBeUndefined()
  })
})
