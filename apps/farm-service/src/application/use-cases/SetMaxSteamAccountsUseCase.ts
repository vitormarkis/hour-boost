import { DataOrFail, EditablePlan, Fail, UsersRepository } from "core"
import { FlushUpdateSteamAccountUseCase } from "~/application/use-cases/FlushUpdateSteamAccountUseCase"
import { uc } from "~/application/use-cases/helpers"
import { TrimSteamAccounts } from "~/domain/utils/trim-steam-accounts"
import { bad, nice } from "~/utils/helpers"

export class SetMaxSteamAccountsUseCase implements ISetMaxSteamAccountsUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly flushUpdateSteamAccountUseCase: FlushUpdateSteamAccountUseCase,
    private readonly trimSteamAccounts: TrimSteamAccounts
  ) {}

  async execute({ mutatingUserId, newMaxSteamAccountsAllowed }: SetMaxSteamAccountsUseCasePayload) {
    const [errorGettingUser, user] = await uc.getUser(this.usersRepository, mutatingUserId)
    if (errorGettingUser) return bad(errorGettingUser)

    const editablePlan = new EditablePlan(user.plan)
    editablePlan.setMaxAccountsAmount(newMaxSteamAccountsAllowed)
    const [errorTrimmingAccounts] = await this.trimSteamAccounts.execute({
      user,
    })
    if (errorTrimmingAccounts) return bad(errorTrimmingAccounts)

    const [error] = await this.flushUpdateSteamAccountUseCase.execute({
      user,
    })
    if (error) return bad(error)
    await this.usersRepository.update(user)

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
