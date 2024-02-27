import { CustomUsagePlan, DiamondPlan, GoldPlan, GuestPlan, PlanUsage } from "core"
import {
  makeTestInstances,
  validSteamAccounts,
  PrefixKeys,
  MakeTestInstancesProps,
  CustomInstances,
} from "~/__tests__/instances"
import { testUsers as s } from "~/infra/services/UserAuthenticationInMemory"
import { UserService } from "./UserService"
import { PlanBuilder } from "~/application/factories/PlanFactory"

const log = console.log
// console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})
let meInstances = {} as PrefixKeys<"me">
let userService: UserService

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  meInstances = await i.createUser("me")

  userService = new UserService()
}

beforeEach(async () => {
  await setupInstances({
    validSteamAccounts,
  })
})

test("should change user plan", async () => {
  expect(meInstances.me.plan).toBeInstanceOf(GuestPlan)
  const newCustomUsagePlan = new PlanBuilder(s.me.userId).usage().custom(meInstances.me.plan as PlanUsage)
  const { updatedCacheStates } = userService.changePlan(meInstances.me, newCustomUsagePlan, [])
  expect(updatedCacheStates).toStrictEqual([])
  expect(meInstances.me.plan).toBeInstanceOf(CustomUsagePlan)
})

test("should change between infinity", async () => {
  const diamondPlan = new PlanBuilder(meInstances.me.id_user).infinity().diamond()
  userService.changePlan(meInstances.me, diamondPlan, [])

  expect(meInstances.me.plan).toBeInstanceOf(DiamondPlan)
  const newPlan = new PlanBuilder(meInstances.me.id_user).infinity().gold()
  userService.changePlan(meInstances.me, newPlan, [])
  expect(meInstances.me.plan).toBeInstanceOf(GoldPlan)
})
