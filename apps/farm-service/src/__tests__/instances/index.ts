import { IDGeneratorUUID, SteamAccount, SteamAccountCredentials, User } from "core"
import { makeSACFactory } from "~/__tests__/factories"
import { UsersSACsFarmingClusterStorage, AllUsersClientsStorage } from "~/application/services"
import { SteamAccountClient } from "~/application/services/steam"
import { Publisher } from "~/infra/queue"
import {
  UsersInMemory,
  UsersRepositoryInMemory,
  PlanRepositoryInMemory,
  SteamAccountClientStateCacheInMemory,
} from "~/infra/repository"
import { EventEmitterBuilder, SteamAccountClientBuilder } from "~/utils/builders"
import { SteamUserMockBuilder } from "~/utils/builders/SteamMockBuilder"
import { makeUser } from "~/utils/makeUser"

const idGenerator = new IDGeneratorUUID()
export const password = "pass"

export type MakeTestInstancesProps = {
  validSteamAccounts?: SteamAccountCredentials[]
  createUsers?: string[]
}

export type CustomInstances = {
  steamUserBuilder: SteamUserMockBuilder
}

export function makeTestInstances(props?: MakeTestInstancesProps, ci?: CustomInstances) {
  const { validSteamAccounts = [] } = props ?? {}

  const usersMemory = new UsersInMemory()
  const usersClusterStorage = new UsersSACsFarmingClusterStorage()
  const publisher = new Publisher()
  const usersRepository = new UsersRepositoryInMemory(usersMemory)
  const planRepository = new PlanRepositoryInMemory(usersMemory)
  const steamUserBuilder = ci?.steamUserBuilder ?? new SteamUserMockBuilder(validSteamAccounts)
  const emitterBuilder = new EventEmitterBuilder()
  const sacBuilder = new SteamAccountClientBuilder(emitterBuilder, publisher, steamUserBuilder)
  const allUsersClientsStorage = new AllUsersClientsStorage(sacBuilder)
  const sacStateCacheRepository = new SteamAccountClientStateCacheInMemory()
  const sacFactory = makeSACFactory(validSteamAccounts, publisher)
  async function createUser<P extends TestUsers>(userPrefix: P) {
    console.log("test instances index > creating user and storing on repo")
    const userInstances = makeUserInstances(userPrefix, testUsers[userPrefix], sacFactory)
    const user = userInstances[userPrefix as any]
    await usersRepository.create(user)
    return userInstances as PrefixKeys<P>
  }

  return {
    usersMemory,
    usersClusterStorage,
    publisher,
    usersRepository,
    planRepository,
    steamUserBuilder,
    emitterBuilder,
    sacBuilder,
    allUsersClientsStorage,
    sacStateCacheRepository,
    sacFactory,
    createUser,
  }
}

export const testUsers: Record<TestUsers, TestUserProperties> = {
  me: {
    userId: "123",
    username: "vrsl",
    accountName: "paco",
  },
} as const

export type PrefixKeys<P extends string> = {
  [K in keyof UserRelatedInstances as `${P & string}${K & string}`]: UserRelatedInstances[K]
}

export type UserRelatedInstances = {
  "": User
  SteamAccount: SteamAccount
  SAC: SteamAccountClient
}

type SACFactory = ReturnType<typeof makeSACFactory>

export function makeUserInstances<P extends TestUsers>(
  prefix: P,
  { accountName, userId, username }: TestUserProperties,
  sacFactory: SACFactory
): PrefixKeys<P> {
  const user = makeUser(userId, username)
  const steamAccount = makeSteamAccount(user.id_user, accountName)
  const sac = sacFactory(user, accountName)
  user.addSteamAccount(steamAccount)
  return {
    [`${prefix}`]: user,
    [`${prefix}SteamAccount`]: steamAccount,
    [`${prefix}SAC`]: sac,
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

export type TestUsers = "me"

type TestUserProperties = {
  userId: string
  username: string
  accountName: string
}
