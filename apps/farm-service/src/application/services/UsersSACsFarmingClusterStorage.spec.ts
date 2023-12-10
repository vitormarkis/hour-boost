import { CreateUser, SteamAccountClientStateCacheRepository, User } from "core"
import { create } from "domain"
import SteamUser from "steam-user"
import { FarmServiceFactory } from "~/application/factories"
import { EventEmitter, UserSACsFarmingCluster, UsersSACsFarmingClusterStorage } from "~/application/services"
import { SteamAccountClient } from "~/application/services/steam"
import { SteamBuilder } from "~/contracts"
import { Publisher } from "~/infra/queue"
import { SteamAccountClientStateCacheInMemory, UsersInMemory, UsersRepositoryInMemory } from "~/infra/repository"
import { SteamUserMock } from "~/infra/services"
import { makeUser } from "~/utils/makeUser"

const log = console.log
console.log = () => { }

const validSteamAccounts = [
  { accountName: "paco", password: "123" },
  { accountName: "mathx99", password: "123" },
]

const ME_ID = "123"
const ME_ACCOUNTNAME = "paco"
const ME_USERNAME = "vrsl"

const MATH_ID = "_123"
const MATH_ACCOUNTNAME = "mathx99"
const MATH_USERNAME = "math"

let sut: UsersSACsFarmingClusterStorage
let steamBuilder: SteamBuilder
let usersMemory: UsersInMemory
let publisher: Publisher
let usersRepository: UsersRepositoryInMemory
let sacStateCacheRepository: SteamAccountClientStateCacheRepository
let me: User
let math: User

beforeEach(() => {
  sut = new UsersSACsFarmingClusterStorage()
  steamBuilder = {
    create: () => new SteamUserMock(validSteamAccounts) as unknown as SteamUser,
  }
  publisher = new Publisher()
  usersMemory = new UsersInMemory()
  usersRepository = new UsersRepositoryInMemory(usersMemory)
  sacStateCacheRepository = new SteamAccountClientStateCacheInMemory()
  me = makeUser(ME_ID, ME_USERNAME)
  math = makeUser(MATH_ID, MATH_USERNAME)
  usersRepository.create(me)
  jest.useFakeTimers()
})

afterAll(() => {
  jest.useRealTimers()
})

export const emitterBuilder = {
  create: () => new EventEmitter()
}


export function makeUserCluster(user: User) {
  return new UserSACsFarmingCluster({
    farmService: new FarmServiceFactory({
      publisher,
      username: user.username,
    }).createNewFarmService(user.plan),
    sacStateCacheRepository,
    username: user.username
  })
}

export function makeSac(user: User, accountName: string) {
  return new SteamAccountClient({
    instances: {
      emitter: emitterBuilder.create(),
      publisher,
    },
    props: {
      accountName,
      client: steamBuilder.create(),
      userId: user.id_user,
      username: user.username
    }
  })
}

describe("List test suite", () => {
  test("should LIST accounts status", async () => {
    const meCluster = makeUserCluster(me)
    sut.add(me.username, meCluster)
    const me_accountName_sac = makeSac(me, ME_ACCOUNTNAME)
    meCluster.addSAC(me_accountName_sac)
    meCluster.farmWithAccount(ME_ACCOUNTNAME, [109], me.plan)
    jest.advanceTimersByTime(1000 * 60) // 1 minute
    meCluster.pauseFarmOnAccount(ME_ACCOUNTNAME)
    const accountStatus = sut.getAccountsStatus()
    expect(accountStatus).toStrictEqual({
      vrsl: {
        paco: "IDDLE"
      },
    })
  })

  test("should LIST accounts status", async () => {
    const meCluster = makeUserCluster(me)
    const mathCluster = makeUserCluster(math)
    const me_accountName_sac = makeSac(me, ME_ACCOUNTNAME)
    const math_accountName_sac = makeSac(math, MATH_ACCOUNTNAME)
    sut.add(me.username, meCluster).addSAC(me_accountName_sac).farmWithAccount(ME_ACCOUNTNAME, [109], me.plan)
    sut.add(math.username, mathCluster).addSAC(math_accountName_sac).farmWithAccount(MATH_ACCOUNTNAME, [109], math.plan)
    const accountStatus = sut.getAccountsStatus()
    expect(accountStatus).toStrictEqual({
      vrsl: {
        paco: "FARMING"
      },
      math: {
        mathx99: "FARMING"
      }
    })
  })
})