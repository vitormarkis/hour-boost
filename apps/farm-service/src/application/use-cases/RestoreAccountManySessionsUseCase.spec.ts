import { CacheState, type CacheStateDTO, type PlanUsage, Usage } from "core"
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
import { UpdateAccountCacheStateHandler } from "~/domain/handler/UpdateAccountCacheStateHandler"
import { testUsers as s } from "~/infra/services/UserAuthenticationInMemory"
import { listAllAccountsInDatabase } from "~/utils/list"
import { RestoreAccountSessionUseCase } from "."
import { AutoRestartCron } from "../cron/AutoRestartCron"
import { RestoreAccountConnectionUseCase } from "./RestoreAccountConnectionUseCase"
import { RestoreAccountManySessionsUseCase } from "./RestoreAccountManySessionsUseCase"

const log = console.log
console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})
let meInstances = {} as PrefixKeys<"me">
let friendInstances = {} as PrefixKeys<"friend">
let restoreAccountManySessionsUseCase: RestoreAccountManySessionsUseCase
let meStateDTO: CacheStateDTO
let friendStateDTO: CacheStateDTO

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  i.publisher.register(new UpdateAccountCacheStateHandler(i.sacStateCacheRepository))
  meInstances = await i.createUser("me")
  friendInstances = await i.createUser("friend", { persistSteamAccounts: true })

  meStateDTO = {
    accountName: s.me.accountName,
    farmStartedAt: new Date().getTime(),
    isFarming: true,
    gamesPlaying: [100],
    gamesStaging: [100],
    planId: meInstances.me.plan.id_plan,
    status: "online" as const,
    username: s.me.username,
  }
  friendStateDTO = {
    accountName: s.friend.accountName,
    farmStartedAt: new Date().getTime(),
    isFarming: true,
    gamesPlaying: [100],
    gamesStaging: [100],
    planId: friendInstances.friend.plan.id_plan,
    status: "online" as const,
    username: s.friend.username,
  }

  const restoreAccountSessionUseCase = new RestoreAccountSessionUseCase(i.usersClusterStorage, i.publisher)
  const restoreAccountConnectionUseCase = new RestoreAccountConnectionUseCase(
    i.allUsersClientsStorage,
    i.usersClusterStorage,
    i.sacStateCacheRepository
  )
  const autoRestartCron = new AutoRestartCron(
    i.allUsersClientsStorage,
    i.planRepository,
    i.steamAccountsRepository,
    restoreAccountConnectionUseCase,
    restoreAccountSessionUseCase,
    i.usersDAO,
    i.sacStateCacheRepository
  )
  restoreAccountManySessionsUseCase = new RestoreAccountManySessionsUseCase(
    i.steamAccountsDAO,
    autoRestartCron
  )
}

beforeEach(async () => {
  import.meta.jest.useFakeTimers({ doNotFake: ["setTimeout", "setImmediate", "setInterval", "nextTick"] })
  console.log = () => {}
  await setupInstances({
    validSteamAccounts,
  })
  console.log = log
})
afterEach(() => {
  import.meta.jest.useRealTimers()
})

describe("2 accounts, one used all plan usage limit", () => {
  beforeEach(async () => {
    const meState = CacheState.restoreFromDTO(meStateDTO)
    const friendState = CacheState.restoreFromDTO(friendStateDTO)
    await i.sacStateCacheRepository.save(meState)
    await i.sacStateCacheRepository.save(friendState)
    const meAccountState = (await i.sacStateCacheRepository.get(s.me.accountName))!
    const friendAccountState = (await i.sacStateCacheRepository.get(s.friend.accountName))!
    expect(meAccountState.isFarming()).toBe(true)
    expect(meAccountState.gamesPlaying).toStrictEqual([100])
    expect(friendAccountState.isFarming()).toBe(true)
    expect(friendAccountState.gamesPlaying).toStrictEqual([100])
    const steamAccountsInDatabase = await listAllAccountsInDatabase(i.usersRepository)
    expect(steamAccountsInDatabase).toHaveLength(2)
    const usage = Usage.create({
      accountName: s.me.accountName,
      amountTime: 21600,
      createdAt: new Date(),
      plan_id: meInstances.me.plan.id_plan,
      user_id: s.me.userId,
    })
    await i.usePlan(s.me.userId, usage)
    const meUser = await i.usersRepository.getByID(s.me.userId)
    expect((meUser?.plan as PlanUsage).getUsageLeft()).toBe(0)
  })

  test("should restore both accounts connections, but only one farm", async () => {
    const meSac = i.allUsersClientsStorage.getAccountClient(s.me.userId, s.me.accountName)!
    const friendSac = i.allUsersClientsStorage.getAccountClient(s.friend.userId, s.friend.accountName)!
    const spy_friendGamesPlayed = import.meta.jest.spyOn(friendSac.client, "gamesPlayed")
    const spy_friendFarmGames = import.meta.jest.spyOn(friendSac, "farmGames")

    const [error, result] = await restoreAccountManySessionsUseCase.execute({
      batchOptions: {
        batchAmount: 99,
        intervalInSeconds: 0,
        noiseInSeconds: 0,
      },
    })
    expect(error).toBeNull()
    expect(result.promisesAmount).toBe(2)

    const meAccountState = (await i.sacStateCacheRepository.get(s.me.accountName))!
    expect(meAccountState.isFarming()).toBe(false)
    expect(meAccountState.gamesPlaying).toStrictEqual([])

    expect(friendSac.logged).toBe(true)
    expect(friendSac.isFarming()).toBe(true)
    expect(friendSac.getGamesPlaying()).toStrictEqual([100])
    expect(friendSac.getCache().toDTO()).toStrictEqual(friendStateDTO)
    expect(spy_friendFarmGames).toHaveBeenCalledTimes(1)
    expect(spy_friendFarmGames).toHaveBeenCalledWith([100])
    expect(spy_friendGamesPlayed).toHaveBeenCalledWith([100])
    expect(meSac.logged).toBe(true)
    expect(meSac.getGamesPlaying()).toStrictEqual([])
    expect(meSac.isFarming()).toBe(false)
    // @ ele bateu na validação e pausou o farm no cache
    const finalMeDTO: CacheStateDTO = {
      ...meStateDTO,
      farmStartedAt: null,
      gamesPlaying: [],
      isFarming: false,
    }
    expect(meSac.getCache().toDTO()).toStrictEqual(finalMeDTO)
  }, 999999)
})
