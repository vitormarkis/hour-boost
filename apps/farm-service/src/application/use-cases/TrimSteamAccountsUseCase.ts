import { DataOrFail, Fail, UsersRepository } from "core"
import { uc } from "~/application/use-cases/helpers"
import { TrimSteamAccounts } from "~/domain/utils/trim-steam-accounts"
import { bad, nice } from "~/utils/helpers"

interface ITrimSteamAccountsUseCase {
  execute(props: Input): Promise<DataOrFail<Fail>>
}

export class TrimSteamAccountsUseCase implements ITrimSteamAccountsUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly trimSteamAccounts: TrimSteamAccounts
  ) {}

  async execute({ userId }: Input) {
    const [errorGettingUser, user] = await uc.getUser(this.usersRepository, userId)
    if (errorGettingUser) return bad(errorGettingUser)

    const [errorTrimmingAccounts] = this.trimSteamAccounts.execute({
      user,
    })

    if (errorTrimmingAccounts) return bad(errorTrimmingAccounts)

    return nice()
  }
}

type Input = {
  userId: string
}
