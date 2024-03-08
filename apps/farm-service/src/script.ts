import type { PlanSetters } from "core"
import {
  autoRestartCron,
  changeUserPlanUseCase,
  usersRepository,
} from "~/presentation/instances"

async function main() {
  const mutatingUserId = "user_2XhCIwGjiPYDC35lIWBpF0OapkN"
  const newMaxGamesAllowed = 4

  const [error1, result1] = await autoRestartCron.run({
    accountName: "versalebackup",
    forceRestoreSessionOnApplication: true,
  })
  const user = await usersRepository.getByID(mutatingUserId)
  const [error, response] = await changeUserPlanUseCase.execute({
    newPlanName: "GUEST",
    user: user!,
  })

  console.log(error, response)

  // if (error1) return console.log(error1)

  // let user = await usersRepository.getByID(mutatingUserId)
  // if (!user) {
  //   return console.log(
  //     Fail.create(EAppResults["USER-NOT-FOUND"], 404, { givenUserId: mutatingUserId, foundUser: user })
  //   )
  // }
  // if (!user.plan.isCustom()) {
  //   console.log("33: PLANO DO USUARIO NÃO É CUSTOM, VAI ATUALIZAR")
  //   const [error, userWithCustomPlan] = await changeUserPlanToCustomUseCase.execute({ user })
  //   if (error) return console.log(error)
  //   user = userWithCustomPlan
  // }
  // console.log("33: PLANO DO USUARIO DEVE SER CUSTOM", { isCustom: user.plan.isCustom() })

  // setMaxGamesAllowed(newMaxGamesAllowed, user.plan as unknown as PlanSetters)
  // console.log("33: ATUALIZOU JOGOS, DEVE SER 4", { maxGames: user.plan.maxGamesAllowed })

  // console.log("33: VAI SALVAR NO BANCO AS ALTERAÇÕES")
  // await usersRepository.update(user)

  // const dbUser = await usersRepository.getByID(mutatingUserId)
  // console.log(dbUser?.plan)
}

main()

function setMaxGamesAllowed(newMaxGamesAllowed: number, planSetters: PlanSetters) {
  planSetters.setMaxGamesAllowed(newMaxGamesAllowed)
}
