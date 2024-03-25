import { DataOrFail, Fail, User } from "core"
import { RemoveSteamAccount } from "~/features/remove-steam-account/domain"
import { bad, nice } from "~/utils/helpers"
import { trimAccountsName } from "~/utils/trimAccountsName"

interface ITrimSteamAccounts {
  execute(props: Input): DataOrFail<Fail>
}

export class TrimSteamAccounts implements ITrimSteamAccounts {
  constructor(private readonly removeSteamAccount: RemoveSteamAccount) {}

  execute({ user }: Input) {
    const trimmingAccountsName = trimAccountsName({
      plan: user.plan,
      steamAccounts: user.steamAccounts.data,
    })

    const failsTrimmingAccount: Fail[] = []
    const removeSteamAccountsResults = trimmingAccountsName.map(accountName => {
      return this.removeSteamAccount.execute({
        accountName,
        user,
      })
    })

    if (failsTrimmingAccount.length)
      return bad(Fail.create("LIST::TRIMMING-ACCOUNTS", 400, failsTrimmingAccount))
    return nice({
      trimmingAccountsName,
      removeSteamAccountsResults,
    })
  }
}

type Input = {
  user: User
}
