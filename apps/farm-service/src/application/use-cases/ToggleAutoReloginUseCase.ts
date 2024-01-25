import { DataOrFail, PlanRepository, SteamAccountsRepository } from "core"
import { bad, nice } from "~/utils/helpers"

export type ToggleAutoReloginUseCasePayload = {
  planId: string
  accountName: string
  userId: string
}

type LocalError = { code: string }

interface IToggleAutoReloginUseCase {
  execute(...args: any[]): Promise<DataOrFail<LocalError, { newValue: boolean }>>
}

export class ToggleAutoReloginUseCase implements IToggleAutoReloginUseCase {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly steamAccountsRepository: SteamAccountsRepository
  ) {}

  async execute({ planId, accountName, userId }: ToggleAutoReloginUseCasePayload) {
    const plan = await this.planRepository.getById(planId)
    if (!plan) {
      return bad({ code: "PLAN_NOT_FOUND" })
    }
    if (!plan.autoRestarter) {
      return bad({ code: "PLAN_DOES_NOT_SUPPORT_AUTO_RELOGIN" })
    }
    const steamAccount = await this.steamAccountsRepository.getByAccountName(accountName)
    if (!steamAccount) {
      return bad({ code: "STEAM_ACCOUNT_NOT_FOUND" })
    }
    if (steamAccount.ownerId !== userId) {
      return bad({ code: "USER_ARE_NOT_ACCOUNT_OWNER" })
    }

    steamAccount.toggleAutoRelogin()
    await this.steamAccountsRepository.save(steamAccount)

    return nice({
      newValue: steamAccount.autoRelogin,
    })
  }
}
