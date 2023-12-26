import {
  ApplicationError,
  IDGeneratorUUID,
  PlanInfinity,
  PlanUsage,
  SteamAccount,
  SteamAccountCredentials,
  Usage,
  User,
} from "core"
import Redis from "ioredis"
import { makeSACFactory } from "~/__tests__/factories"
import { FarmServiceBuilder } from "~/application/factories"
import { AllUsersClientsStorage, UsersSACsFarmingClusterStorage } from "~/application/services"
import { SteamAccountClient } from "~/application/services/steam"
import { UsersDAOInMemory } from "~/infra/dao"
import { redis } from "~/infra/libs/redis"
import { Publisher } from "~/infra/queue"
import {
  PlanRepositoryInMemory,
  SteamAccountClientStateCacheInMemory,
  SteamAccountsRepositoryInMemory,
  UsersInMemory,
  UsersRepositoryInMemory,
} from "~/infra/repository"
import { SteamAccountClientStateCacheRedis } from "~/infra/repository/SteamAccountClientStateCacheRedis"
import { EventEmitterBuilder, SteamAccountClientBuilder } from "~/utils/builders"
import { SteamUserMockBuilder } from "~/utils/builders/SteamMockBuilder"
import { UsageBuilder } from "~/utils/builders/UsageBuilder"
import { UserClusterBuilder } from "~/utils/builders/UserClusterBuilder"
import { makeUser } from "~/utils/makeUser"

export const password = "pass"
export const validSteamAccounts: SteamAccountCredentials[] = [
  { accountName: "paco", password },
  { accountName: "fred", password },
  { accountName: "bane", password },
]

const idGenerator = new IDGeneratorUUID()

export type MakeTestInstancesProps = {
  validSteamAccounts?: SteamAccountCredentials[]
  createUsers?: string[]
}

export type CustomInstances = {
  steamUserBuilder: SteamUserMockBuilder
}

export function makeTestInstances(props?: MakeTestInstancesProps, ci?: CustomInstances) {
  const { validSteamAccounts = [] } = props ?? {}
  const redis = new Redis({
    commandTimeout: 1000 * 3,
    connectTimeout: 1000 * 3,
    sentinelCommandTimeout: 1000 * 3,
  })

  const idGenerator = new IDGeneratorUUID()
  const publisher = new Publisher()
  const usersMemory = new UsersInMemory()
  const sacStateCacheRepository = new SteamAccountClientStateCacheInMemory()
  // const sacStateCacheRepository = new SteamAccountClientStateCacheRedis(redis)
  const usersRepository = new UsersRepositoryInMemory(usersMemory)
  const planRepository = new PlanRepositoryInMemory(usersMemory)
  const steamAccountsRepository = new SteamAccountsRepositoryInMemory(usersMemory)
  const usersDAO = new UsersDAOInMemory(usersMemory)
  const usageBuilder = new UsageBuilder()
  const emitterBuilder = new EventEmitterBuilder()
  const steamUserBuilder = ci?.steamUserBuilder ?? new SteamUserMockBuilder(validSteamAccounts)
  const sacBuilder = new SteamAccountClientBuilder(emitterBuilder, publisher, steamUserBuilder)
  const farmServiceBuilder = new FarmServiceBuilder({
    publisher,
    emitterBuilder,
  })
  const userClusterBuilder = new UserClusterBuilder(
    farmServiceBuilder,
    sacStateCacheRepository,
    planRepository,
    emitterBuilder,
    publisher,
    usageBuilder
  )
  const allUsersClientsStorage = new AllUsersClientsStorage(sacBuilder)
  const usersClusterStorage = new UsersSACsFarmingClusterStorage(userClusterBuilder)
  const sacFactory = makeSACFactory(validSteamAccounts, publisher)

  async function createUser<P extends TestUsers>(userPrefix: P) {
    console.log("test instances index > creating user and storing on repo")
    const userInstances = makeUserInstances(userPrefix, testUsers[userPrefix], sacFactory)
    const user = userInstances[userPrefix as any]
    await usersRepository.create(user)
    return userInstances as PrefixKeys<P>
  }
  async function addSteamAccount(
    userId: string,
    accountName: string,
    password: string,
    id_steamAccount?: string
  ) {
    const user = await usersRepository.getByID(userId)
    if (!user) throw new Error("addSteamAccount(): INSTANCES TEST Usuário não existe.")
    const steamAccount = SteamAccount.restore({
      credentials: SteamAccountCredentials.restore({
        accountName,
        password,
      }),
      id_steamAccount: id_steamAccount ?? idGenerator.makeID(),
      ownerId: userId,
    })
    user.addSteamAccount(steamAccount)
    await usersRepository.update(user)
    return steamAccount
  }
  async function changeUserPlan(plan: PlanUsage | PlanInfinity) {
    const userId = plan.ownerId
    const user = await usersRepository.getByID(userId)
    if (!user) throw new Error("addSteamAccount(): INSTANCES TEST Usuário não existe.")
    user.assignPlan(plan)
    await usersRepository.update(user)
  }

  async function usePlan(ownerId: string, usage: Usage) {
    const user = await usersRepository.getByID(ownerId)
    if (!user) throw new Error("addSteamAccount(): INSTANCES TEST Usuário não existe.")
    if (!(user.plan instanceof PlanUsage))
      throw new ApplicationError("instances.usePlan() Plano não é do tipo usage.")
    user.plan.use(usage)
    await usersRepository.update(user)
  }

  return {
    usersMemory,
    publisher,
    usersClusterStorage,
    allUsersClientsStorage,
    steamUserBuilder,
    userClusterBuilder,
    emitterBuilder,
    usageBuilder,
    sacBuilder,
    usersDAO,
    usersRepository,
    sacStateCacheRepository,
    steamAccountsRepository,
    planRepository,
    sacFactory,
    createUser,
    addSteamAccount,
    changeUserPlan,
    usePlan,
  }
}

export const testUsers: Record<TestUsers, TestUserProperties> = {
  me: {
    userId: "123",
    username: "vrsl",
    accountName: "paco",
    accountName2: "bane",
    accountName3: "plan",
  },
  friend: {
    userId: "f_123",
    username: "mathew",
    accountName: "fred",
    accountName2: "noka",
    accountName3: "urto",
  },
} as const

export type PrefixKeys<P extends string> = {
  [K in keyof UserRelatedInstances as `${P & string}${K & string}`]: UserRelatedInstances[K]
}

export type UserRelatedInstances = {
  "": User
  SteamAccount: SteamAccount
  SAC: SteamAccountClient
  SAC2: SteamAccountClient
}

type SACFactory = ReturnType<typeof makeSACFactory>

export function makeUserInstances<P extends TestUsers>(
  prefix: P,
  { accountName, userId, username, accountName2 }: TestUserProperties,
  sacFactory: SACFactory
): PrefixKeys<P> {
  const user = makeUser(userId, username)
  const steamAccount = makeSteamAccount(user.id_user, accountName)
  const sac = sacFactory(user, accountName)
  const sac2 = sacFactory(user, accountName2)
  user.addSteamAccount(steamAccount)
  return {
    [`${prefix}`]: user,
    [`${prefix}SteamAccount`]: steamAccount,
    [`${prefix}SAC`]: sac,
    [`${prefix}SAC2`]: sac2,
  } as PrefixKeys<P>
}

export function makeSteamAccount(ownerId: string, accountName: string) {
  return SteamAccount.create({
    credentials: SteamAccountCredentials.create({
      accountName,
      password,
    }),
    idGenerator,
    ownerId,
  })
}

export type TestUsers = "me" | "friend"

type TestUserProperties = {
  userId: string
  username: string
  accountName: string
  accountName2: string
  accountName3: string
}
