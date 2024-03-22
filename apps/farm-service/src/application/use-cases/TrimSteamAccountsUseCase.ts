import { DataOrFail, Fail, PlanInfinity, PlanUsage, SteamAccount } from "core"
import { RemoveSteamAccountUseCase } from "~/application/use-cases"
import { bad, nice } from "~/utils/helpers"
import { trimAccountsName } from "~/utils/trimAccountsName"

interface ITrimSteamAccountsUseCase {
  execute(props: Input): Promise<DataOrFail<Fail>>
}

export class TrimSteamAccountsUseCase implements ITrimSteamAccountsUseCase {
  constructor(private readonly removeSteamAccountUseCase: RemoveSteamAccountUseCase) {}

  async execute({ plan, steamAccounts, userId, username }: Input) {
    const trimmingAccountsName = trimAccountsName({
      plan,
      steamAccounts,
    })

    const failsTrimmingAccount: Fail[] = []
    if (trimmingAccountsName.length) {
      for (const accountName of trimmingAccountsName) {
        const [error] = await this.removeSteamAccountUseCase.execute({
          accountName,
          steamAccountId: steamAccounts.find(sa => sa.credentials.accountName === accountName)!
            .id_steamAccount,
          userId,
          username,
        })

        if (error) failsTrimmingAccount.push(error)
      }
    }

    if (failsTrimmingAccount.length)
      return bad(Fail.create("LIST::TRIMMING-ACCOUNTS", 400, failsTrimmingAccount))
    return nice()
  }
}

type Input = {
  userId: string
  username: string
  plan: PlanUsage | PlanInfinity
  steamAccounts: SteamAccount[]
}
