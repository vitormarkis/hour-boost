import { ApplicationError, DataOrError, PlanInfinity, PlanType } from "core"
import { UserCompletedFarmSessionInfinityCommand } from "~/application/commands/UserCompletedFarmSessionInfinityCommand"
import { AccountStatusList, FarmService } from "~/application/services/FarmService"
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

  farmWithAccountImpl(accountName: string): DataOrError<null> {
    this.farmingAccounts.set(accountName, {
      accountName,
      startedAt: new Date(),
    })
    return [null, null]
  }

  protected stopFarm(): void {
    this.publishCompleteFarmSession()
    this.farmingAccounts.clear()
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

  private getAccount(accountName: string): FarmInfinityAccountStatus | null {
    const foundAccount = this.farmingAccounts.get(accountName)
    return foundAccount ?? null
  }

  protected startFarm(): DataOrError<null> {
    return [new ApplicationError("Method not implemented.", 400), null]
  }

  pauseFarmOnAccount(accountName: string): void {
    const account = this.getAccount(accountName)
    if (!account) return
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
