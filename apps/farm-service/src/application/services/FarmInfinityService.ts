import { ApplicationError, PlanInfinity, PlanType, Usage } from "core"
import { UserCompletedFarmSessionInfinityCommand } from "~/application/commands/UserCompletedFarmSessionInfinityCommand"
import { AccountStatusList, FarmService } from "~/application/services/FarmService"
import { getUsageAmountTimeFromDateRange } from "~/domain/utils/getUsageAmountTimeFromDateRange"
import { Publisher } from "~/infra/queue"

export type FarmInfinityAccountStatus = {
  accountName: string
  startedAt: Date
}

export class FarmInfinityService extends FarmService {
  protected readonly farmingAccounts = new Map<string, FarmInfinityAccountStatus>()
  type: PlanType = "INFINITY"

  constructor(publisher: Publisher, plan: PlanInfinity, username: string, now: Date) {
    super({
      planId: plan.id_plan,
      startedAt: now,
      userId: plan.ownerId,
      username,
      publisher,
    })
  }

  getAccountsStatus(): AccountStatusList {
    const accountStatusList: AccountStatusList = {}

    for (const [accountName] of this.farmingAccounts) {
      accountStatusList[accountName] = "FARMING"
    }

    return accountStatusList
  }

  farmWithAccountImpl(accountName: string): void {
    this.farmingAccounts.set(accountName, {
      accountName,
      startedAt: new Date(),
    })
  }

  protected startFarm(): void {
    throw new Error("Method not implemented.")
  }
  protected stopFarm(): void {
    this.farmingAccounts.clear()
    this.publishCompleteFarmSession()
  }

  protected publishCompleteFarmSession(): void {
    const now = new Date()
    for (const [accountName, farmingAccountDetails] of this.farmingAccounts) {
      this.publisher.publish(
        new UserCompletedFarmSessionInfinityCommand({
          accountName,
          planId: this.planId,
          startedAt: farmingAccountDetails.startedAt,
          when: now,
        })
      )
    }
  }

  private getAccountOrThrow(accountName: string): FarmInfinityAccountStatus {
    const foundAccount = this.farmingAccounts.get(accountName)
    if (!foundAccount) throw new ApplicationError("Você tentou pausar uma conta que não está farmando.")
    return foundAccount
  }

  pauseFarmOnAccount(accountName: string): void {
    const account = this.getAccountOrThrow(accountName)
    this.publisher.publish(
      new UserCompletedFarmSessionInfinityCommand({
        accountName,
        startedAt: account.startedAt,
        when: new Date(),
        planId: this.planId,
      })
    )
    this.farmingAccounts.delete(accountName)
  }

  protected startFarmImpl(): void {
    console.log(`${this.username} starting farming`)
  }
  protected stopFarmImpl(): void {
    console.log(`${this.username} stopping farming`)
  }
}
