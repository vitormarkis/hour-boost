import { DiamondPlan, GoldPlan } from "core"
import {
  type CustomInstances,
  type MakeTestInstancesProps,
  type PrefixKeys,
  makeTestInstances,
  validSteamAccounts,
} from "~/__tests__/instances"
import { PlanBuilder } from "~/application/factories/PlanFactory"
import { UserService } from "./UserService"

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

test("should change between infinity", async () => {
  const diamondPlan = new PlanBuilder(meInstances.me.id_user).infinity().diamond()
  userService.changePlan(meInstances.me, diamondPlan, [])

  expect(meInstances.me.plan).toBeInstanceOf(DiamondPlan)
  const newPlan = new PlanBuilder(meInstances.me.id_user).infinity().gold()
  userService.changePlan(meInstances.me, newPlan, [])
  expect(meInstances.me.plan).toBeInstanceOf(GoldPlan)
})
