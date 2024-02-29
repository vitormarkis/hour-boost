import { CustomUsagePlan, GuestPlan } from "core"
import {
  makeTestInstances,
  validSteamAccounts,
  PrefixKeys,
  MakeTestInstancesProps,
  CustomInstances,
} from "~/__tests__/instances"
import { testUsers as s } from "~/infra/services/UserAuthenticationInMemory"
import { ChangeUserPlanToCustomUseCase } from "./ChangeUserPlanToCustomUseCase"
import { ChangeUserPlanUseCase } from "./ChangeUserPlanUseCase"
import { RemoveSteamAccountUseCase } from "./RemoveSteamAccountUseCase"
import { RestoreAccountSessionUseCase } from "."
import { FarmGamesController } from "~/presentation/controllers"
import { isAccountFarmingOnCluster, isAccountFarmingOnClusterByUsername } from "~/utils/isAccount"
import { TEST_FarmGames, makeFarmGames } from "./__tests_helpers"

const log = console.log
// console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})
let meInstances = {} as PrefixKeys<"me">
let changeUserPlanToCustomUseCase: ChangeUserPlanToCustomUseCase
let farmGamesController: FarmGamesController
let farmGames: TEST_FarmGames

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  meInstances = await i.createUser("me")

  const removeSteamAccountUseCase = new RemoveSteamAccountUseCase(
    i.usersRepository,
    i.allUsersClientsStorage,
    i.sacStateCacheRepository,
    i.usersClusterStorage,
    i.planRepository,
    i.autoRestarterScheduler
  )
  const restoreAccountSessionUseCase = new RestoreAccountSessionUseCase(i.usersClusterStorage, i.publisher)
  const changeUserPlanUseCase = new ChangeUserPlanUseCase(
    i.allUsersClientsStorage,
    i.usersRepository,
    i.planService,
    i.sacStateCacheRepository,
    removeSteamAccountUseCase,
    restoreAccountSessionUseCase,
    i.userService
  )
  farmGamesController = new FarmGamesController({
    allUsersClientsStorage: i.allUsersClientsStorage,
    farmGamesUseCase: i.farmGamesUseCase,
    usersRepository: i.usersRepository,
  })
  farmGames = makeFarmGames(farmGamesController)
  changeUserPlanToCustomUseCase = new ChangeUserPlanToCustomUseCase(changeUserPlanUseCase)
}

beforeEach(async () => {
  await setupInstances({
    validSteamAccounts,
  })
})

test("should change guest plan to custom usage plan", async () => {
  const me_isAccountFarming = isAccountFarmingOnClusterByUsername(i.usersClusterStorage, s.me.username)
  const res_farmGames = await farmGames(s.me.accountName, [100], s.me.userId)
  expect(res_farmGames.status).toBe(200)
  const [, isAccountFarming] = me_isAccountFarming(s.me.accountName)
  expect(isAccountFarming).toBe(true)

  expect(meInstances.me.plan).toBeInstanceOf(GuestPlan)
  const [error] = await changeUserPlanToCustomUseCase.execute({
    user: meInstances.me,
  })
  expect(error).toBeNull()
  const [, isAccountFarming2] = me_isAccountFarming(s.me.accountName)
  expect(isAccountFarming2).toBe(true)
  const user = await i.usersRepository.getByID(s.me.userId)
  expect(user?.plan).toBeInstanceOf(CustomUsagePlan)
})
