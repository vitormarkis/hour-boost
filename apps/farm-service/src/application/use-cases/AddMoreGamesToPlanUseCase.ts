import { DataOrFail, EditablePlan, Fail, UsersRepository } from "core"
import { FlushUpdateSteamAccountUseCase } from "~/application/use-cases/FlushUpdateSteamAccountUseCase"
import { bad, nice } from "~/utils/helpers"
import { EAppResults } from "."

export class AddMoreGamesToPlanUseCase implements IAddMoreGamesToPlanUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly flushUpdateSteamAccountUseCase: FlushUpdateSteamAccountUseCase
  ) {}

  async execute({ mutatingUserId, newMaxGamesAllowed }: AddMoreGamesToPlanUseCasePayload) {
    let user = await this.usersRepository.getByID(mutatingUserId)
    if (!user) {
      return bad(
        Fail.create(EAppResults["USER-NOT-FOUND"], 404, { givenUserId: mutatingUserId, foundUser: user })
      )
    }

    const editablePlan = new EditablePlan(user.plan)
    editablePlan.setMaxGamesAmount(newMaxGamesAllowed)

    const [error] = await this.flushUpdateSteamAccountUseCase.execute({
      user,
    })
    if (error) return bad(error)

    return nice(user)
  }
}

export type AddMoreGamesToPlanUseCasePayload = {
  mutatingUserId: string
  newMaxGamesAllowed: number
}

interface IAddMoreGamesToPlanUseCase {
  execute(...args: any[]): Promise<DataOrFail<any>>
}
