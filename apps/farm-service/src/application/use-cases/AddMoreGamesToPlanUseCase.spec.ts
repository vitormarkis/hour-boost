import { CustomUsagePlan, PlanUsage } from "core"
import {
  CustomInstances,
  MakeTestInstancesProps,
  PrefixKeys,
  makeTestInstances,
  validSteamAccounts,
} from "~/__tests__/instances"
import { testUsers as s } from "~/infra/services/UserAuthenticationInMemory"
import { RestoreAccountSessionUseCase } from "."
import { AddMoreGamesToPlanUseCase } from "./AddMoreGamesToPlanUseCase"
import { ChangeUserPlanToCustomUseCase } from "./ChangeUserPlanToCustomUseCase"
import { ChangeUserPlanUseCase } from "./ChangeUserPlanUseCase"
import { RemoveSteamAccountUseCase } from "./RemoveSteamAccountUseCase"

const log = console.log
console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})
let meInstances = {} as PrefixKeys<"me">
let addMoreGamesToPlanUseCase: AddMoreGamesToPlanUseCase

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  meInstances = await i.makeUserInstances("me", s.me)
  const removeSteamAccountUseCase = new RemoveSteamAccountUseCase(
    i.usersRepository,
    i.allUsersClientsStorage,
    i.sacStateCacheRepository,
    i.usersClusterStorage,
    i.planRepository,
    i.autoRestarterScheduler
  )
  const restoreAccountSessionUseCase = new RestoreAccountSessionUseCase(i.usersClusterStorage)
  const changeUserPlanUseCase = new ChangeUserPlanUseCase(
    i.allUsersClientsStorage,
    i.usersRepository,
    i.planService,
    i.sacStateCacheRepository,
    removeSteamAccountUseCase,
    restoreAccountSessionUseCase,
    i.userService
  )
  // const farmGamesController = new FarmGamesController({
  //   allUsersClientsStorage: i.allUsersClientsStorage,
  //   farmGamesUseCase: i.farmGamesUseCase,
  //   usersRepository: i.usersRepository,
  // })
  const changeUserPlanToCustomUseCase = new ChangeUserPlanToCustomUseCase(changeUserPlanUseCase)
  addMoreGamesToPlanUseCase = new AddMoreGamesToPlanUseCase(i.usersRepository, changeUserPlanToCustomUseCase)
}

beforeEach(async () => {
  await setupInstances({
    validSteamAccounts,
  })
})

test("should change usage plan to CUSTOM usage plan and increase max games allowed to 30", async () => {
  const userPlan = await i.planRepository.getById(meInstances.me.plan.id_plan)
  expect(userPlan).toBeInstanceOf(PlanUsage)
  expect(userPlan?.maxGamesAllowed).toBe(1)

  const [error] = await addMoreGamesToPlanUseCase.execute({
    userId: s.me.userId,
    newMaxGamesAllowed: 30,
  })
  expect(error).toBeNull()

  const userPlan2 = await i.planRepository.getById(meInstances.me.plan.id_plan)
  expect(userPlan2).toBeInstanceOf(CustomUsagePlan)
  expect(userPlan2?.maxGamesAllowed).toBe(30)
})
