import { CacheState } from "./CacheState"

const log = console.log
console.log = () => {}

beforeEach(async () => {})

test("should create a cache state", async () => {
  const cache = CacheState.create({
    accountName: "vitor",
    planId: "plan_123",
    status: "online",
    username: "versalebackup",
  })

  expect(cache.gamesPlaying).toStrictEqual([])
  expect(cache.gamesStaging).toStrictEqual([])
  expect(cache.farmStartedAt).toBeNull()
  expect(cache.isFarming()).toBe(false)
})

test("should change status", async () => {
  const cache = CacheState.create({
    accountName: "vitor",
    planId: "plan_123",
    status: "online",
    username: "versalebackup",
  })

  cache.changeStatus("offline")
  expect(cache.status).toBe("offline")
})

test("should farm", async () => {
  jest.useFakeTimers().setSystemTime(new Date("2023-05-11T10:00:00.000Z"))
  const cache = CacheState.create({
    accountName: "vitor",
    planId: "plan_123",
    status: "online",
    username: "versalebackup",
  })
  expect(cache.farmStartedAt).toBeNull()

  cache.farmGames([123, 3453])
  expect(cache.gamesPlaying).toHaveLength(2)
  expect(cache.gamesPlaying).toStrictEqual([123, 3453])
  expect(cache.isFarming()).toBe(true)
  expect(cache.farmStartedAt).toStrictEqual(new Date("2023-05-11T10:00:00.000Z"))
  jest.useRealTimers()
})

test("should farm and create DTO", async () => {
  jest.useFakeTimers().setSystemTime(new Date("2023-05-11T10:00:00.000Z"))
  const cache = CacheState.create({
    accountName: "vitor",
    planId: "plan_123",
    status: "online",
    username: "versalebackup",
  })
  cache.farmGames([123, 3453])
  expect(cache.toDTO()).toStrictEqual(
    expect.objectContaining({
      isFarming: true,
    })
  )
  jest.useRealTimers()
})

test("should farm and stop", async () => {
  jest.useFakeTimers().setSystemTime(new Date("2023-05-11T10:00:00.000Z"))
  const cache = CacheState.create({
    accountName: "vitor",
    planId: "plan_123",
    status: "online",
    username: "versalebackup",
  })
  expect(cache.farmStartedAt).toBeNull()

  cache.farmGames([123, 3453])
  jest.advanceTimersByTime(1000 * 60 * 60 * 5)
  cache.stopFarm()
  expect(cache.gamesPlaying).toHaveLength(0)
  expect(cache.gamesPlaying).toStrictEqual([])
  expect(cache.isFarming()).toBe(false)
  expect(cache.farmStartedAt).toStrictEqual(null)
  jest.useRealTimers()
})

test("should farm, stop and return correct usage amount", async () => {
  jest.useFakeTimers().setSystemTime(new Date("2023-05-11T10:00:00.000Z"))
  const cache = CacheState.create({
    accountName: "vitor",
    planId: "plan_123",
    status: "online",
    username: "versalebackup",
  })
  cache.farmGames([123, 3453])
  jest.advanceTimersByTime(1000 * 60 * 60 * 5)
  const usage = cache.stopFarm()
  expect(usage.amountTime).toBe(60 * 60 * 5)
  jest.useRealTimers()
})

describe("Invariant", () => {
  test("throw if farm started at truthy, but not farming", async () => {
    expect(() =>
      CacheState.restore({
        accountName: "vitor",
        planId: "plan_123",
        status: "online",
        username: "versalebackup",
        farmStartedAt: new Date(),
        gamesPlaying: [],
        gamesStaging: [],
      })
    ).toThrow("Invariant! Não está farmando e started at está truthy.")
  })
  test("throw if is farming, but farm started at is null", async () => {
    expect(() =>
      CacheState.restore({
        accountName: "vitor",
        planId: "plan_123",
        status: "online",
        username: "versalebackup",
        farmStartedAt: null,
        gamesPlaying: [100],
        gamesStaging: [100],
      })
    ).toThrow("Invariant! Está farmando mas started at está como nulo.")
  })
})
