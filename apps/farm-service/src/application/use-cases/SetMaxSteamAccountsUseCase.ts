import { DataOrFail, EditablePlan, Fail, UsersRepository } from "core"
import { FlushUpdateSteamAccountUseCase } from "~/application/use-cases/FlushUpdateSteamAccountUseCase"
import { TrimSteamAccountsUseCase } from "~/application/use-cases/TrimSteamAccountsUseCase"
import { bad, nice } from "~/utils/helpers"
import { EAppResults } from "."

export class SetMaxSteamAccountsUseCase implements ISetMaxSteamAccountsUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly flushUpdateSteamAccountUseCase: FlushUpdateSteamAccountUseCase,
    private readonly trimSteamAccountsUseCase: TrimSteamAccountsUseCase
  ) {}

  async execute({ mutatingUserId, newMaxSteamAccountsAllowed }: SetMaxSteamAccountsUseCasePayload) {
    const user = await this.usersRepository.getByID(mutatingUserId)
    if (!user) {
      return bad(
        Fail.create(EAppResults["USER-NOT-FOUND"], 404, { givenUserId: mutatingUserId, foundUser: user })
      )
    }

    const editablePlan = new EditablePlan(user.plan)
    editablePlan.setMaxAccountsAmount(newMaxSteamAccountsAllowed)
    const [errorTrimmingAccounts] = await this.trimSteamAccountsUseCase.execute({
      plan: user.plan,
      steamAccounts: user.steamAccounts.data,
      userId: user.id_user,
      username: user.username,
    })
    if (errorTrimmingAccounts) return bad(errorTrimmingAccounts)

    const [error] = await this.flushUpdateSteamAccountUseCase.execute({
      user,
    })
    if (error) return bad(error)

    return nice(user)
  }
}

export type SetMaxSteamAccountsUseCasePayload = {
  mutatingUserId: string
  newMaxSteamAccountsAllowed: number
}

interface ISetMaxSteamAccountsUseCase {
  execute(...args: any[]): Promise<DataOrFail<Fail>>
}
