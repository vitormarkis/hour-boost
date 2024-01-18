import { ApplicationError, DataOrError, PlanInfinity, PlanType, Usage } from "core"
import { UserCompleteFarmSessionCommand } from "~/application/commands"
import {
  AccountStatusList,
  FarmService,
  NSFarmService,
  PauseFarmOnAccountUsage,
} from "~/application/services/FarmService"
import { getUsageAmountTimeFromDateRange } from "~/domain/utils/getUsageAmountTimeFromDateRange"
import { Publisher } from "~/infra/queue"
import { UsageBuilder } from "~/utils/builders/UsageBuilder"

export type FarmInfinityAccountStatus = {
  accountName: string
  startedAt: Date
}

export class FarmInfinityService extends FarmService {
  readonly usageBuilder = new UsageBuilder()
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

  getActiveFarmingAccountsAmount(): number {
    return this.farmingAccounts.size
  }

  hasAccountsFarming(): boolean {
    return this.getActiveFarmingAccountsAmount() > 0
  }

  protected publishCompleteFarmSession(
    pauseFarmCategory: PauseFarmOnAccountUsage,
    killSession: boolean
  ): void {
    this.publisher.publish(
      new UserCompleteFarmSessionCommand({
        pauseFarmCategory,
        planId: this.planId,
        when: new Date(),
        killSession,
      })
    )
  }

  protected getFarmingAccountsNameList(): string[] {
    return Array.from(this.farmingAccounts.keys())
  }

  protected stopFarmImpl() {
    const now = new Date()
    const usages: Usage[] = []
    for (const [accountName, farmingAccountDetails] of this.farmingAccounts) {
      const amountTime = getUsageAmountTimeFromDateRange(farmingAccountDetails.startedAt, now)
      const usage = this.usageBuilder.create({
        accountName,
        amountTime,
        createdAt: now,
        plan_id: this.planId,
      })
      usages.push(usage)
    }
    this.farmingAccounts.clear()
    return { usages }
  }

  protected stopFarmSync(): Usage[] {
    const { usages } = this.stopFarmImpl()
    return usages
  }

  private pauseFarmOnAccountImpl(accountName: string): DataOrError<Usage> {
    const account = this.getAccount(accountName)
    if (!account) {
      return [
        new ApplicationError(
          `Tentativa de pausar farm na conta [${accountName}], mas ela não foi encontrada.`
        ),
      ]
    }
    const when = new Date()
    const amountTime = getUsageAmountTimeFromDateRange(this.startedAt, when)
    const usageBuilder = new UsageBuilder()
    const usage = usageBuilder.create({
      accountName,
      amountTime,
      createdAt: when,
      plan_id: this.planId,
    })
    this.farmingAccounts.delete(accountName)
    return [null, usage]
  }

  pauseFarmOnAccount(accountName: string, killSession: boolean): DataOrError<null> {
    const [errorPausingFarmOnAccount, usage] = this.pauseFarmOnAccountImpl(accountName)
    if (errorPausingFarmOnAccount) return [errorPausingFarmOnAccount]
    this.publishCompleteFarmSession({ type: "STOP-ONE", usage, accountName }, killSession)
    return [null, null]
  }

  pauseFarmOnAccountSync(accountName: string): DataOrError<PauseFarmOnAccountUsage> {
    const [errorPausingFarmOnAccount, usage] = this.pauseFarmOnAccountImpl(accountName)
    if (errorPausingFarmOnAccount) return [errorPausingFarmOnAccount]
    return [null, { type: "STOP-ONE", usage, accountName }]
  }

  // pauseFarmOnAccount(accountName: string): DataOrError<PauseFarmOnAccountUsage> {
  // }

  // protected stopFarm(): void {
  //   this.publishCompleteFarmSession()
  //   this.farmingAccounts.clear()
  // }

  getAccountsStatus(): AccountStatusList {
    const accountStatusList: AccountStatusList = {}

    for (const [accountName] of this.farmingAccounts) {
      accountStatusList[accountName] = "FARMING"
    }

    return accountStatusList
  }

  getFarmingAccounts(): DataOrError<NSFarmService.GetFarmingAccounts> {
    let accountStatus = {} as NSFarmService.GetFarmingAccounts
    for (const [accountName] of this.farmingAccounts) {
      accountStatus[accountName] = "FARMING"
    }

    return [null, accountStatus]
  }

  farmWithAccountImpl(accountName: string): DataOrError<null> {
    this.farmingAccounts.set(accountName, {
      accountName,
      startedAt: new Date(),
    })
    return [null, null]
  }

  private getAccount(accountName: string): FarmInfinityAccountStatus | null {
    const foundAccount = this.farmingAccounts.get(accountName)
    return foundAccount ?? null
  }

  protected stopFarm(killSession: boolean): void {
    const { usages } = this.stopFarmImpl()
    this.publishCompleteFarmSession(
      {
        type: "STOP-ALL",
        usages,
        accountNameList: this.getFarmingAccountsNameList(),
      },
      killSession
    )
  }

  protected startFarm(): DataOrError<null> {
    return [new ApplicationError("Method not implemented.", 400)]
  }

  protected startFarmImpl(): void {
    console.log(`${this.username} starting farming`)
  }

  farmWithAccount(accountName: string): DataOrError<null> {
    if (this.isAccountAdded(accountName)) {
      return [new ApplicationError("Essa conta já está farmando.")]
    } else {
      this.farmWithAccountImpl(accountName)
    }
    return [null, null]
  }

  isAccountFarming(accountName: string): boolean {
    return this.farmingAccounts.has(accountName)
  }

  isAccountAdded(accountName: string): boolean {
    return this.farmingAccounts.has(accountName)
  }
}
