const log = console.log

import { ApplicationError, PlanType } from "core"
import { UserHasStartFarmingCommand } from "~/application/commands"
import { FarmServiceStatus } from "~/application/services"
import { Publisher } from "~/infra/queue"

type AccountFarmingStatus = "FARMING" | "IDDLE"

export type FarmingAccountDetails = {
  usageAmountInSeconds: number
  status: AccountFarmingStatus
}

export type FarmingAccountDetailsWithAccountName = FarmingAccountDetails & {
  accountName: string
}

export type FarmServiceProps = {
  startedAt: Date
  planId: string
  userId: string
  username: string
  publisher: Publisher
}

export abstract class FarmService {
  protected readonly accountsFarming = new Map<string, FarmingAccountDetails>()
  protected readonly publisher: Publisher
  abstract readonly type: PlanType
  protected status: FarmServiceStatus
  protected readonly startedAt: Date
  protected readonly planId: string
  protected readonly userId: string
  protected readonly username: string

  constructor(props: FarmServiceProps) {
    this.status = "IDDLE"
    this.startedAt = props.startedAt
    this.planId = props.planId
    this.userId = props.userId
    this.username = props.username
    this.publisher = props.publisher
  }

  getAccountDetails(accountName: string) {
    return this.accountsFarming.get(accountName) ?? null
  }

  getAccountsStatus() {
    let accountStatus: any = {}
    for (const [accountName, details] of this.accountsFarming) {
      accountStatus[accountName] = details.status
    }
    return accountStatus
  }

  private setAccountStatus(accountName: string, status: "FARMING" | "IDDLE") {
    const account = this.getAccountDetails(accountName)
    if (!account) {
      const msg = `NSTH: Tried to resume farming on account that don't exists. ${accountName}`
      throw new ApplicationError(msg, 500)
    }
    account.status = status
  }

  private appendAccount(accountName: string) {
    this.accountsFarming.set(accountName, {
      usageAmountInSeconds: 0,
      status: "FARMING",
    })
  }

  private resumeFarming(accountName: string) {
    this.setAccountStatus(accountName, "FARMING")
  }

  private isAccountAdded(accountName: string) {
    return !!this.getAccountDetails(accountName)
  }

  farmWithAccount(accountName: string): void {
    if (this.getActiveFarmingAccountsAmount() === 0) {
      this.publisher.publish(
        new UserHasStartFarmingCommand({
          planId: this.planId,
          userId: this.userId,
          when: new Date(),
        })
      )
      this.startFarm()
    }

    if (this.isAccountAdded(accountName)) {
      this.resumeFarming(accountName)
    } else {
      this.appendAccount(accountName)
    }
  }

  pauseFarmOnAccount(accountName: string): void {
    if (this.getActiveFarmingAccountsAmount() === 1) {
      this.stopFarm()
    }
    this.setAccountStatus(accountName, "IDDLE")
  }

  getServiceStatus() {
    return this.status
  }

  private startFarm(): void {
    this.status = "FARMING"
    return this.startFarmImpl()
  }

  private stopFarm(): void {
    this.status = "IDDLE"
    this.publishCompleteFarmSession()
    return this.stopFarmImpl()
  }

  stopFarmAllAccounts() {
    this.accountsFarming.forEach(acc => (acc.status = "IDDLE"))
    this.stopFarm()
  }

  protected abstract startFarmImpl(): void
  protected abstract stopFarmImpl(): void
  abstract publishCompleteFarmSession(): void

  private getActiveFarmingAccounts() {
    return Array.from(this.accountsFarming).filter(([_, details]) => details.status === "FARMING")
  }

  getActiveFarmingAccountsAmount() {
    return this.getActiveFarmingAccounts().length
  }

  hasAccountsFarming(): boolean {
    return this.getActiveFarmingAccountsAmount() > 0
  }

  getFarmingAccounts() {
    const farmingAccounts: Record<string, AccountFarmingStatus> = {}
    for (const [accountName, details] of this.accountsFarming) {
      farmingAccounts[accountName] = details.status
    }
    return farmingAccounts
  }

  getPlanId() {
    return this.planId
  }

  getUserId() {
    return this.userId
  }

  getUsername() {
    return this.username
  }
}
