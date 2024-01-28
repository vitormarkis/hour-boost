import { DataOrFail, PlanRepository, SteamAccountsRepository, UsersDAO } from "core"
import { AllUsersClientsStorage } from "~/application/services"
import { bad, nice } from "~/utils/helpers"

export type ToggleAutoReloginUseCasePayload = {
  accountName: string
  userId: string
}

type LocalError = { code: string }

interface IToggleAutoReloginUseCase {
  execute(...args: any[]): Promise<DataOrFail<LocalError, { newValue: boolean }>>
}

export class ToggleAutoReloginUseCase implements IToggleAutoReloginUseCase {
  constructor(
    private readonly allUsersClientsStorage: AllUsersClientsStorage,
    private readonly planRepository: PlanRepository,
    private readonly steamAccountsRepository: SteamAccountsRepository,
    private readonly usersDAO: UsersDAO
  ) {}

  async execute({ accountName, userId }: ToggleAutoReloginUseCasePayload) {
    const sac = this.allUsersClientsStorage.getAccountClient(userId, accountName)
    if (!sac) {
      return bad({ code: "SAC_NOT_FOUND" })
    }
    const planId = await this.usersDAO.getPlanId(userId)
    if (!planId) {
      return bad({ code: "PLAN_OR_USER_NOT_FOUND" })
    }

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
    sac.setAutoRestart(steamAccount.autoRelogin)

    return nice({
      newValue: steamAccount.autoRelogin,
    })
  }
}
