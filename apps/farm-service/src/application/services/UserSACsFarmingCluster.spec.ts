import { SteamAccountClientStateCacheRepository, User } from "core"
import { connection } from "~/__tests__/connection"
import { makeSACFactory, makeUserClusterFactory } from "~/__tests__/factories"
import { validSteamAccounts } from "~/__tests__/validSteamAccounts"
import { Publisher } from "~/infra/queue"
import { SteamAccountClientStateCacheInMemory } from "~/infra/repository"
import { makeUser } from "~/utils/makeUser"

export const _me = {
  id: "123",
  username: "vrsl",
  accountName: "paco"
}

let publisher: Publisher
let sacStateCacheRepository: SteamAccountClientStateCacheRepository
let me: User

let makeSAC: ReturnType<typeof makeSACFactory>
let makeUserCluster: ReturnType<typeof makeUserClusterFactory>

beforeEach(() => {
  jest.useFakeTimers()
  publisher = new Publisher()
  sacStateCacheRepository = new SteamAccountClientStateCacheInMemory()
  me = makeUser(_me.id, _me.username)
  makeSAC = makeSACFactory(validSteamAccounts, publisher)
  makeUserCluster = makeUserClusterFactory(publisher, sacStateCacheRepository)
})

afterAll(() => {
  jest.useRealTimers()
})

test("should ", async () => {
  const meCluster = makeUserCluster(me)
  const sac = makeSAC(me, _me.accountName)
  meCluster.addSAC(sac)
  meCluster.farmWithAccount(_me.accountName, [100], me.plan)
  jest.advanceTimersByTime(1000 * 3600 * 2) // 2 hours
  // connection.emit("break")
  meCluster.stopFarmAllAccounts()
})

