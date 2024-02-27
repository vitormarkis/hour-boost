import { DataOrFail, Fail, PlanSetters, UsersRepository } from "core"
import { bad, nice } from "~/utils/helpers"
import { EAppResults } from "."
import { ChangeUserPlanToCustomUseCase } from "./ChangeUserPlanToCustomUseCase"

export class AddMoreGamesToPlanUseCase implements IAddMoreGamesToPlanUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly changeUserPlanToCustomUseCase: ChangeUserPlanToCustomUseCase
  ) {}

  async execute({ userId, newMaxGamesAllowed }: AddMoreGamesToPlanUseCasePayload) {
    let user = await this.usersRepository.getByID(userId)
    if (!user) {
      return bad(Fail.create(EAppResults["USER-NOT-FOUND"], 404, { givenUserId: userId, foundUser: user }))
    }
    if (!user.plan.isCustom()) {
      const [error, userWithCustomPlan] = await this.changeUserPlanToCustomUseCase.execute({ user })
      if (error) return bad(error)
      user = userWithCustomPlan
    }

    setMaxGamesAllowed(newMaxGamesAllowed, user.plan as unknown as PlanSetters)
    await this.usersRepository.update(user)
    return nice(user)
  }
}

export type AddMoreGamesToPlanUseCasePayload = {
  userId: string
  newMaxGamesAllowed: number
}

interface IAddMoreGamesToPlanUseCase {
  execute(...args: any[]): Promise<DataOrFail<any>>
}

function setMaxGamesAllowed(newMaxGamesAllowed: number, planSetters: PlanSetters) {
  planSetters.setMaxGamesAllowed(newMaxGamesAllowed)
}
